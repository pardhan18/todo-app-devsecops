pipeline {
    agent any

    environment {
        IMAGE_NAME = "todo-app"
        IMAGE_TAG = "v1"
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

        stage('Stop Old Container') {
            steps {
                echo 'Stopping old container if exists'
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
                    -e PORT=${PORT} \
                    ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Smoke Test') {
            steps {
                echo 'Running Smoke Test...'

                sh """
                sleep 10
                curl -f http://localhost:${PORT} || exit 1
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
                } else {
                    echo 'Trivy report not found, skipping archive'
                }
            }
        }

        failure {
            echo 'Pipeline FAILED ❌'
        }
    }
}