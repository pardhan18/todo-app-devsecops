pipeline {
    agent any

    environment {
        // ===== App config =====
        APP_NAME = "todo-app"
        IMAGE_TAG = "24"

        // FIX: define container name (this was your crash)
        CONTAINER_NAME = "todo-container"

        // Docker Hub
        DOCKER_REPO = "anooppedu2023"
        IMAGE_FULL = "${DOCKER_REPO}/${APP_NAME}:${IMAGE_TAG}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    docker build -t ${APP_NAME}:${IMAGE_TAG} .
                """
            }
        }

        stage('Trivy Scan') {
            steps {
                sh """
                    trivy image --exit-code 0 --severity HIGH,CRITICAL ${APP_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Login & Push to DockerHub') {
            steps {
                withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKER_TOKEN')]) {
                    sh '''
                        echo "$DOCKER_TOKEN" | docker login -u anooppedu2023 --password-stdin

                        docker tag ${APP_NAME}:${IMAGE_TAG} ${IMAGE_FULL}
                        docker push ${IMAGE_FULL}
                    '''
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
                sh """
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p 3000:3000 \
                        ${IMAGE_FULL}
                """
            }
        }

        stage('Smoke Test') {
            steps {
                sh """
                    sleep 5
                    curl -f http://localhost:3000 || exit 1
                """
            }
        }
    }

    post {
        always {
            cleanWs()
        }

        success {
            echo "Pipeline SUCCESS ✅"
        }

        failure {
            echo "Pipeline FAILED ❌"
        }
    }
}
