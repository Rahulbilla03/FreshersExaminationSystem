using FreshserExaminationSystem.Models;

public class ExamAttempt
{
    public int ExamAttemptId { get; set; }

    public int EnrollmentId { get; set; }
    public Enrollment Enrollment { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;  
    public DateTime? CompletedAt { get; set; }              

    public bool IsCompleted { get; set; } = false;
    public bool IsEvaluated { get; set; } = false;   

    public decimal TotalScore { get; set; }
    public bool IsPassed { get; set; }

    public ICollection<ExamAttemptAnswer> Answers { get; set; }
}
