using System.Text.Json.Serialization;

namespace FreshserExaminationSystem.Models
{
    public class Question
    {
        [JsonIgnore]
        public int QuestionId { get; set; }
        public int ExamId { get; set; }
        public string QuestionText { get; set; }
        public bool IsMultipleChoice { get; set; }=false;
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? CorrectOption { get; set; }
        public int Marks { get; set; }
        public Exam? Exam { get; set; }
        
    }
}
