pipeline {
    agent any

    environment {
        DOCKER_IMAGE_BACKEND = 'latherline-backend:latest'
        DOCKER_IMAGE_FRONTEND = 'latherline-frontend:latest'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Skipping checkout: using the pre-mounted codebase directly to avoid slow file copying.'
            }
        }

        stage('Build Backend') {
            steps {
                dir('/var/jenkins_home/workspace/lather-line/backend') {
                    sh 'chmod +x mvnw'
                    sh './mvnw clean package'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('/var/jenkins_home/workspace/lather-line/frontend') {
                    echo 'Running Frontend Tests inside Docker build instead to avoid requiring Node on Jenkins.'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                // Build Backend Image
                dir('/var/jenkins_home/workspace/lather-line/backend') {
                    sh "docker build -t ${DOCKER_IMAGE_BACKEND} ."
                }
                
                // Build Frontend Image
                dir('/var/jenkins_home/workspace/lather-line/frontend') {
                    sh "docker build -t ${DOCKER_IMAGE_FRONTEND} ."
                }
            }
        }

        stage('Deploy') {
            steps {
                dir('/var/jenkins_home/workspace/lather-line/infra') {
                    sh 'docker compose -f docker-compose.yml up -d'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution complete.'
        }
        success {
            echo 'Build and Deployment were successful!'
        }
        failure {
            echo 'Build failed. Check the logs for details.'
        }
    }
}
