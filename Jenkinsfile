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

        stage('Verify Code') {
            steps {
                sh 'ls -la'
                sh 'git log -1'
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

        stage('Login & Push to DockerHub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_TOKEN'
                    )
                ]) {

                    sh """
                    echo $DOCKER_TOKEN | docker login -u $DOCKER_USER --password-stdin

                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} \
                    $DOCKER_USER/${IMAGE_NAME}:${IMAGE_TAG}

                    docker push $DOCKER_USER/${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Stop Old Container') {
            steps {
                sh """
                docker rm -f ${CONTAINER_NAME} || true
                """
            }
        }

        stage('Run New Container') {
            steps {
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
                        $DOCKER_USER/${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Smoke Test') {
            steps {
                sh """
                sleep 10
                docker exec ${CONTAINER_NAME} curl -f http://localhost:${PORT}
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
    }
}