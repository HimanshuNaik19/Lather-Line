import hudson.model.*
import jenkins.model.*
import org.jenkinsci.plugins.workflow.job.WorkflowJob
import org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition

def jenkins = Jenkins.getInstance()
def jobName = "lather-line-pipeline"
def job = jenkins.getItem(jobName)
if (job == null) {
  job = jenkins.createProject(WorkflowJob.class, jobName)
}

// Read the Jenkinsfile from the mounted workspace
def script = new File("/var/jenkins_home/workspace/lather-line/Jenkinsfile").text

job.setDefinition(new CpsFlowDefinition(script, true))
job.save()

// Trigger the build
jenkins.getQueue().schedule(job, 0)
println "Job created and triggered successfully!"
