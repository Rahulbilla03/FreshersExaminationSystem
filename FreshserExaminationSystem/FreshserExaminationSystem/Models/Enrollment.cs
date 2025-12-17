using System.Text.Json.Serialization;

namespace FreshserExaminationSystem.Models
{
    public class Enrollment
    {
      
        public int? EnrollmentId { get; set; }
        public int UserId { get; set; }
        public int ExamId { get; set; }
        public DateTime EnrollmentDate { get; set; }

       
        public Exam? Exam { get; set; }
      
        public User? User { get; set; }
        public ICollection<ExamAttempt> Attempts { get; set; } = new List<ExamAttempt>();
    }
}
