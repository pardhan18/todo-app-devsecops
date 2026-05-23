pipeline {
    agent any

    environment {
        IMAGE_NAME = "todo-app"
        IMAGE_TAG = "v1"
        CONTAINER_NAME = "smoke-test"
        PORT = "3000"
        TEST_PORT = "3001"
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

        stage('Smoke Test Image') {
            steps {
                echo 'Running Smoke Test'

                sh """
                docker rm -f ${CONTAINER_NAME} || true

                docker run -d --rm \
                    --name ${CONTAINER_NAME} \
                    -p ${TEST_PORT}:${PORT} \
                    -e PORT=${PORT} \
                    ${IMAGE_NAME}:${IMAGE_TAG}

                echo "Waiting for app to start..."

                for i in \$(seq 1 10)
                do
                    echo "Attempt \$i..."
                    curl -f http://localhost:${TEST_PORT} && exit 0
                    sleep 2
                done

                echo "Smoke Test FAILED ❌"
                docker logs ${CONTAINER_NAME}
                exit 1
                """
            }
        }

        stage('Stop Old Container') {
            steps {
                echo 'Stopping old container'
                sh "docker rm -f todo-container || true"
            }
        }

        stage('Run New Container') {
            steps {
                echo 'Deploying new container'

                sh """
                docker run -d \
                    --name todo-container \
                    -p ${PORT}:${PORT} \
                    -e PORT=${PORT} \
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
