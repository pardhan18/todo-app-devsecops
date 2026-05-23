pipeline {
    agent any

    environment {
        IMAGE_NAME = "todo-app"
        CONTAINER_NAME = "todo-container"
        IMAGE_TAG = "v1"
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

        stage('Smoke Test Image') {
            steps {
                echo 'Running container for smoke test'

                sh """
                docker run -d --rm --name smoke-test -p 3001:3000 ${IMAGE_NAME}:${IMAGE_TAG}
                sleep 5
                curl -f http://localhost:3001 || exit 1
                docker stop smoke-test || true
                """
            }
        }

        stage('Stop Old Container') {
            steps {
                echo 'Stopping old container'
                sh "docker rm -f ${CONTAINER_NAME} || true"
            }
        }

        stage('Run New Container') {
            steps {
                echo 'Deploying new container'
                sh """
                docker run -d \
                --name ${CONTAINER_NAME} \
                -p ${PORT}:${PORT} \
                ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

    }

    post {
        success {
            echo 'Pipeline SUCCESS ✅'
        }
        failure {
            echo 'Pipeline FAILED ❌'
        }
    }
}
