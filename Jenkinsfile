pipeline {
    agent any

    environment {
        IMAGE_NAME     = 'meli-front'
        CONTAINER_NAME = 'meli-front'
        HOST_PORT      = '5501'
        CONTAINER_PORT = '80'
        VITE_API_URL   = '/meli/api'
    }

    stages {
        stage('Build') {
            steps {
                sh 'docker build --build-arg VITE_API_URL="$VITE_API_URL" -t $IMAGE_NAME .'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -e

                    docker stop "$CONTAINER_NAME" || true
                    docker rm "$CONTAINER_NAME" || true

                    docker run -d \
                        -p 127.0.0.1:$HOST_PORT:$CONTAINER_PORT \
                        --name "$CONTAINER_NAME" \
                        --restart unless-stopped \
                        "$IMAGE_NAME"
                '''
            }
        }
    }

    post {
        failure {
            echo 'Deploy falhou'
        }

        success {
            echo 'Deploy concluído com sucesso.'
        }
    }
}
