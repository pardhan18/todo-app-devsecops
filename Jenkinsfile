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
                git branch: 'main',
                    url: 'https://github.com/pardhan18/todo-app-devsecops.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh """
                npm install
                """
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'

                    withSonarQubeEnv('sonar') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                          -Dsonar.projectKey=todo-app \
                          -Dsonar.projectName=Todo-App \
                          -Dsonar.sources=. \
                          -Dsonar.sourceEncoding=UTF-8 \
                          -Dsonar.scm.provider=git
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                """
            }
        }

        stage('Trivy Scan') {
            steps {
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

        stage('Docker Login & Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {

                    sh """
                    echo $DOCKER_TOKEN | docker login -u $DOCKER_USER --password-stdin

                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} \
                    $DOCKER_USER/${IMAGE_NAME}:${IMAGE_TAG}

                    docker push $DOCKER_USER/${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Deploy Container') {
            steps {
                sh """
                docker rm -f ${CONTAINER_NAME} || true

                docker run -d \
                    --name ${CONTAINER_NAME} \
                    -p ${PORT}:${PORT} \
                    -e PORT=${PORT} \
                    ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Smoke Test') {
            steps {
                sh """
                sleep 10
                curl -f http://localhost:${PORT}
                """
            }
        }
    }

    post {
        success {
            echo "Pipeline SUCCESS ✅"

            script {
                if (fileExists('trivy-report.json')) {
                    archiveArtifacts artifacts: 'trivy-report.json'
                }
            }
        }

        failure {
            echo "Pipeline FAILED ❌"
        }

        always {
            cleanWs()
        }
    }
}