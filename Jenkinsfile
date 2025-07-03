pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'brian5702/bookstore:latest'
        DOCKERHUB_CREDENTIALS = 'dckr_pat_2CrIahzifj-SN0LqJLxHy0whCLI'
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/BrianT5702/SC_Assignment-2.git'
            }
        }
        stage('Build') {
            steps {
                sh './mvnw clean package'
            }
        }
        stage('JMeter Test') {
            steps {
                // Assume you have a JMeter test plan in your repo
                sh 'jmeter -n -t test-plan.jmx -l results.jtl'
                perfReport sourceDataFiles: 'results.jtl'
            }
        }
        stage('Update Jira Issue') {
            steps {
                // Example: update a Jira issue (requires Jira plugin and configuration)
                jiraIssueSelector idOrKey: 'PROJECT-1'
                jiraAddComment body: 'Build and test completed in Jenkins pipeline.'
            }
        }
        stage('Docker Build & Push') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', "${DOCKERHUB_CREDENTIALS}") {
                        def app = docker.build("${DOCKER_IMAGE}")
                        app.push()
                    }
                }
            }
        }
    }
    post {
        always {
            junit '**/target/surefire-reports/*.xml'
        }
    }
}