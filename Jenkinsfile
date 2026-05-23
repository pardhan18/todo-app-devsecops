pipeline {
    agent any

    stages {

        stage('Clone Code') {
            steps {
                echo 'Cloning Repository'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'sudo docker build -t todo-app:v1 .'
            }
        }

        stage('Stop Old Container') {
            steps {
                sh 'sudo docker rm -f todo-container || true'
            }
        }

        stage('Run New Container') {
            steps {
                sh '''
                sudo docker run -d \
                --name todo-container \
                -p 3000:3000 \
                todo-app:v1
                '''
            }
        }

    }
}
