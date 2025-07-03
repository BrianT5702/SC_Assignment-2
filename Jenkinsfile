pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'brian5702/bookstore:latest'
        DOCKERHUB_CREDENTIALS = credentials('i_dont_know-Docker')
    }

    stages {
        stage('Build') {
            steps {
                sh './mvnw clean package'
            }
        }
        stage('JMeter Test') {
    steps {
        // Create a minimal JMeter test plan if it doesn't exist
        script {
            def testPlan = '''<?xml version="1.0" encoding="UTF-8"?>
            <jmeterTestPlan version="1.2" properties="5.0" jmeter="5.4.1">
            <hashTree>
                <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="Test Plan" enabled="true">
                <stringProp name="TestPlan.comments"></stringProp>
                <boolProp name="TestPlan.functional_mode">false</boolProp>
                <boolProp name="TestPlan.tearDown_on_shutdown">true</boolProp>
                <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
                <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
                    <collectionProp name="Arguments.arguments"/>
                </elementProp>
                <stringProp name="TestPlan.user_define_classpath"></stringProp>
                </TestPlan>
                <hashTree/>
            </hashTree>
            </jmeterTestPlan>
            '''
                        writeFile file: 'test-plan.jmx', text: testPlan
                    }
                    // Now run JMeter as before
                    sh 'jmeter -n -t test-plan.jmx -l results.jtl'
                    // Optionally, publish the report
                    // perfReport sourceDataFiles: 'results.jtl'
                }
            }
        stage('Update Jira Issue') {
            steps {
                // Example: update a Jira issue (requires Jira plugin and configuration)
                jiraIssueSelector issueSelector: [ 'G5-4' ]
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