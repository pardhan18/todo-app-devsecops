pipeline {
    agent any

    environment {
        IMAGE_NAME = "todo-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = "todo-container"
        PORT = "3000"
    }

    stages {

        stage('Clone Code') {
            steps {
                echo 'Cloning Repository'

                git branch: 'main',
                    url: 'https://github.com/pardhan18/todo-app-devsecops.git'
            }
        }

        stage('Verify Code') {
            steps {
                echo 'Checking latest code'

                sh 'ls -la'
                sh 'git log -1'
            }
        }

        stage('Check Sonar Scanner') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'

                    sh """
                    ${scannerHome}/bin/sonar-scanner -v
                    """
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {

                echo 'Running SonarQube Analysis...'

                script {

                    def scannerHome = tool 'sonar-scanner'

                    withSonarQubeEnv('sonar') {

                        withCredentials([
                            string(
                                credentialsId: 'sonar-token',
                                variable: 'SONAR_TOKEN'
                            )
                        ]) {

                            sh '''
                            '"${scannerHome}"'/bin/sonar-scanner \
                              -Dsonar.projectKey=todo-app \
                              -Dsonar.projectName=Todo-App \
                              -Dsonar.sources=. \
                              -Dsonar.token=$SONAR_TOKEN
                            '''
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {

                echo 'Waiting for Quality Gate...'

                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {

                echo 'Building Docker Image...'

                sh """
                docker build \
                -t ${IMAGE_NAME}:${IMAGE_TAG} .
                """
            }
        }

        stage('Trivy Security Scan') {
            steps {

                echo 'Running Trivy Scan...'

                sh """
                docker run --rm \
                  -v /var/run/docker.sock:/var/run/docker.sock \
                  -v \$PWD:/workspace \
                  aquasec/trivy image \
                  --format json \
                  --output /workspace/trivy-report.json \
                  ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Login & Push to DockerHub') {
            steps {

                echo 'Pushing image to DockerHub...'

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_TOKEN'
                    )
                ]) {

                    sh '''
                    echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin

                    docker tag '"${IMAGE_NAME}:${IMAGE_TAG}"' \
                    "$DOCKER_USER/'"${IMAGE_NAME}"':'"${IMAGE_TAG}"'"

                    docker push \
                    "$DOCKER_USER/'"${IMAGE_NAME}"':'"${IMAGE_TAG}"'"
                    '''
                }
            }
        }

        stage('Stop Old Container') {
            steps {

                echo 'Removing old container if exists...'

                sh """
                docker rm -f ${CONTAINER_NAME} || true
                """
            }
        }

        stage('Run New Container') {
            steps {

                echo 'Deploying container...'

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_TOKEN'
                    )
                ]) {

                    sh """
                    docker run -d \
                      --name ${CONTAINER_NAME} \
                      -p ${PORT}:${PORT} \
                      -e PORT=${PORT} \
                      ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Smoke Test') {
            steps {

                echo 'Running Smoke Test...'

                sh """
                sleep 10

                docker exec ${CONTAINER_NAME} \
                curl -f http://localhost:${PORT}
                """
            }
        }
    }

    post {

        success {

            echo 'Pipeline SUCCESS ✅'

            script {
                if (fileExists('trivy-report.json')) {
                    archiveArtifacts artifacts: 'trivy-report.json'
                }
            }
        }

        failure {

            echo 'Pipeline FAILED ❌'
        }

        always {

            cleanWs()
        }
    }
}