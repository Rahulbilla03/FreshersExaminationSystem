using System.Text.Json.Serialization;

namespace FreshserExaminationSystem.Models
{
    public class Exam
    {
       
        public int? ExamId { get; set; }
        public string Title { get; set; }
        public int DurationInMinutes { get; set; }
        public int TotalMarks { get; set; }
        public decimal PassPercentage { get; set; }=40.0m;

        public bool IsPublished { get; set; }=false;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

       
        public ICollection<Question>? Questions { get; set; }=new List<Question>();
        [JsonIgnore]
        public ICollection<Enrollment> Enrollments { get; set; }=new List<Enrollment>();
    }
}
