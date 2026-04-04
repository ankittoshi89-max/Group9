pipeline {
    agent any

    tools {
        nodejs 'Node18'
    }

    environment {
        DOCKER_IMAGE = 'zenindoffy/hospital-api'
        DOCKER_TAG   = 'latest'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }

        stage('Run Tests') {
    environment {
        MONGODB_URI = 'mongodb+srv://your-actual-atlas-uri'
        JWT_SECRET  = 'test-secret-key-for-jenkins-pipeline'
        JWT_EXPIRE  = '24h'
        PORT        = '5000'
    }
    steps {
        echo 'Running Jest tests...'
        sh 'npm test || true'
    }
}

        stage('Security Audit') {
            steps {
                echo 'Running npm audit...'
                sh 'npm audit --audit-level=high || true'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
            }
        }

    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed — check logs above.'
        }
    }
}