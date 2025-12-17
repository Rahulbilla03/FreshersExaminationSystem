using FreshserExaminationSystem.Database;
using FreshserExaminationSystem.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FreshserExaminationSystem.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

       
        // CREATE USER
        [HttpPost("create-user")]
        public async Task<IActionResult> CreateUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        // CREATE EXAM
        [HttpPost("create-exam")]
        public async Task<IActionResult> CreateExam(Exam exam)
        {
            exam.IsPublished = false;

            _context.Exams.Add(exam);
            await _context.SaveChangesAsync();

            return Ok(exam);
        }

        // PUBLISH EXAM
        [HttpPut("publish-exam/{examId}")]
        public async Task<IActionResult> PublishExam(int examId)
        {
            var exam = await _context.Exams.FindAsync(examId);
            if (exam == null) return NotFound("Exam not found");

            exam.IsPublished = true;
            await _context.SaveChangesAsync();

            return Ok("Exam published");
        }

        // ADD MULTIPLE QUESTIONS
        [HttpPost("add-questions")]
        public async Task<IActionResult> AddQuestions(List<Question> questions)
        {
            if (questions == null || !questions.Any())
                return BadRequest("No questions provided");

            foreach (var q in questions)
            {
                q.QuestionId = 0;
                q.Exam = null;

                if (!q.IsMultipleChoice)
                {
                    q.OptionA = q.OptionB = q.OptionC = q.OptionD = null;
                    q.CorrectOption = null;
                }
            }

            _context.Questions.AddRange(questions);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Questions added successfully" });
        }

        // GET ALL EXAMS
        [HttpGet("exams")]
        public async Task<IActionResult> GetExams()
        {
            var exams = await _context.Exams
                .Select(e => new
                {
                    e.ExamId,
                    e.Title,
                    e.DurationInMinutes,
                    e.TotalMarks,
                    e.PassPercentage,
                    e.IsPublished,
                    e.StartTime,
                    e.EndTime
                })
                .ToListAsync();

            return Ok(exams);
        }

        // GET ENROLLMENTS
        [HttpGet("enrollments")]
        public async Task<IActionResult> GetAllEnrollments()
        {
            var list = await _context.Enrollments
                .Include(x => x.User)
                .Include(x => x.Exam)
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("enrollments/exam/{examId}")]
        public async Task<IActionResult> GetByExamId(int examId)
        {
            var list = await _context.Enrollments
                .Include(x => x.User)
                .Include(x => x.Exam)
                .Where(x => x.ExamId == examId)
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("enrollments/user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var list = await _context.Enrollments
                .Include(x => x.User)
                .Include(x => x.Exam)
                .Where(x => x.UserId == userId)
                .ToListAsync();

            return Ok(list);
        }
        //GET ALL ATTEMPTS
        [HttpGet("attempts")]
        public async Task<IActionResult> GetAllAttempts()
        {
            var attempts = await _context.ExamAttempts
                .Include(a => a.Enrollment)
                    .ThenInclude(e => e.User)
                .ToListAsync();

            var result = attempts.Select(a => new
            {
                a.ExamAttemptId,
                a.EnrollmentId,
                UserId = a.Enrollment.UserId,
                a.StartedAt,
                a.CompletedAt,
                a.TotalScore,
                a.IsPassed,
                a.IsCompleted,
                a.IsEvaluated
            });

            return Ok(result);
        }


        // GET ATTEMPT DETAILS
        [HttpGet("attempt/{attemptId}")]
        public async Task<IActionResult> GetAttemptDetail(int attemptId)
        {
            var attempt = await _context.ExamAttempts
                .Include(a => a.Answers)
                    .ThenInclude(ans => ans.Question)
                .FirstOrDefaultAsync(a => a.ExamAttemptId == attemptId);

            if (attempt == null) return NotFound("Attempt not found");

            return Ok(new
            {
                AttemptId = attemptId,
                attempt.IsEvaluated,
                Questions = attempt.Answers.Select(a => new
                {
                    a.ExamAttemptAnswerId,
                    a.QuestionId,
                    a.Question.QuestionText,
                    a.Question.IsMultipleChoice,
                    a.Question.OptionA,
                    a.Question.OptionB,
                    a.Question.OptionC,
                    a.Question.OptionD,
                    CorrectOption = a.Question.CorrectOption,
                    a.Question.Marks,
                    UserAnswer = a.AnswerText,
                    a.AwardedMarks,
                    a.IsCorrect
                })
            });
        }
        public class EvaluatedAnswer
        {
            public int ExamAttemptAnswerId { get; set; }
            public int AwardedMarks { get; set; }
        }

        // EVALUATE ATTEMPT
        [HttpPost("evaluate/{attemptId}")]
        public async Task<IActionResult> EvaluateAttempt(int attemptId,[FromBody] List<EvaluatedAnswer> evaluations)
        {
            if (evaluations == null || evaluations.Count == 0)
                return BadRequest("Invalid evaluation format");

            var attempt = await _context.ExamAttempts
                .Include(a => a.Answers)
                    .ThenInclude(a => a.Question)
                .Include(a => a.Enrollment)
                    .ThenInclude(e => e.Exam)
                .FirstOrDefaultAsync(a => a.ExamAttemptId == attemptId);

            if (attempt == null)
                return NotFound("Attempt not found");
            if (attempt.IsEvaluated)
                return BadRequest("This attempt has already been evaluated");

            foreach (var item in evaluations)
            {
                var answer = attempt.Answers
                    .FirstOrDefault(a => a.ExamAttemptAnswerId == item.ExamAttemptAnswerId);

                if (answer == null) continue;

                answer.AwardedMarks = item.AwardedMarks;

                if (answer.Question.IsMultipleChoice)
                {
                    answer.IsCorrect =
                        answer.AnswerText == answer.Question.CorrectOption;
                }
            }

            attempt.TotalScore = attempt.Answers.Sum(a => a.AwardedMarks ?? 0);
            attempt.IsEvaluated = true;

            var passMarks =(attempt.Enrollment.Exam.TotalMarks *attempt.Enrollment.Exam.PassPercentage) / 100m;

            attempt.IsPassed = attempt.TotalScore >= passMarks;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Evaluation completed successfully" });
        }

    }
}
