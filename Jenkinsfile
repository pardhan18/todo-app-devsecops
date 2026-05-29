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
                echo "Checking latest code"
                sh 'ls -la'
                sh 'git log -1'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker Image'
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
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
                echo 'Logging in and pushing image to DockerHub...'

                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USER', passwordVariable: 'TOKEN')]) {
                    sh """
                    echo $TOKEN | docker login -u $USER --password-stdin

                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} $USER/${IMAGE_NAME}:${IMAGE_TAG}

                    docker push $USER/${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Stop Old Container') {
            steps {
                echo 'Stopping old container if exists'
                sh "docker rm -f ${CONTAINER_NAME} || true"
            }
        }

        stage('Run New Container') {
            steps {
                echo 'Deploying new container'

                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USER', passwordVariable: 'TOKEN')]) {
                    sh """
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p ${PORT}:${PORT} \
                        -e PORT=${PORT} \
                        $USER/${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Smoke Test') {
            steps {
                echo 'Running Smoke Test inside container...'

                sh """
                sleep 10
                docker exec ${CONTAINER_NAME} curl -f http://localhost:${PORT} || exit 1
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
