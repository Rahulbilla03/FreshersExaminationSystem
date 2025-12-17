namespace FreshserExaminationSystem.Models
{
    public class ExamAttemptAnswer
    {
        public int ExamAttemptAnswerId { get; set; }

        public int ExamAttemptId { get; set; }
        public int QuestionId { get; set; }

        public string AnswerText { get; set; }

        public int? AwardedMarks { get; set; }
        public bool? IsCorrect { get; set; }

        public ExamAttempt ExamAttempt { get; set; }
        public Question Question { get; set; }
    }

}
