using FreshserExaminationSystem.Database;
using FreshserExaminationSystem.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FreshserExaminationSystem.Controllers
{
    [ApiController]
    [Route("api/user")]
    [Authorize(Roles= "User")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET PUBLISHED EXAMS
        [HttpGet("exams")]
        public async Task<IActionResult> GetPublishedExams()
        {
            var exams = await _context.Exams
                .Where(e => e.IsPublished)
                .Select(e => new
                {
                    e.ExamId,
                    e.Title,
                    e.DurationInMinutes,
                    e.TotalMarks,
                    e.PassPercentage,
                    e.StartTime,
                    e.EndTime
                })
                .ToListAsync();

            return Ok(exams);
        }

        // CHECK IF EXAM ALREADY COMPLETED
        [HttpGet("attempt-status/{enrollmentId}")]
        public async Task<IActionResult> GetAttemptStatus(int enrollmentId)
        {
            var attempt = await _context.ExamAttempts
                .Where(a => a.EnrollmentId == enrollmentId)
                .OrderByDescending(a => a.ExamAttemptId)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                isCompleted = attempt?.IsCompleted ?? false,
                isEvaluated = attempt?.IsEvaluated ?? false
            });
        }

        // GET QUESTIONS FOR EXAM
        [HttpGet("questions/{examId}")]
        public async Task<IActionResult> GetQuestions(int examId)
        {
            var questions = await _context.Questions
                .Where(q => q.ExamId == examId)
                .Select(q => new
                {
                    q.QuestionId,
                    q.ExamId,
                    q.QuestionText,
                    q.IsMultipleChoice,
                    q.OptionA,
                    q.OptionB,
                    q.OptionC,
                    q.OptionD,
                    q.CorrectOption,
                    q.Marks
                })
                .ToListAsync();

            return Ok(questions);
        }

        // ENROLL USER
        [HttpPost("enroll")]
        public async Task<IActionResult> Enroll(int userId, int examId)
        {
            bool exists = await _context.Enrollments
                .AnyAsync(x => x.UserId == userId && x.ExamId == examId);

            if (exists)
                return BadRequest("Already enrolled");

            var enrollment = new Enrollment
            {
                UserId = userId,
                ExamId = examId,
                EnrollmentDate = DateTime.UtcNow
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return Ok(enrollment);
        }

        // GET MY ENROLLMENTS + COMPLETION STATUS
        [HttpGet("my-enrollments/{userId}")]
        public async Task<IActionResult> GetMyEnrollments(int userId)
        {
            var list = await _context.Enrollments
                .Include(e => e.Exam)
                .Where(e => e.UserId == userId)
                .ToListAsync();

            var result = new List<object>();

            foreach (var enr in list)
            {
                var lastAttempt = await _context.ExamAttempts
                    .Where(a => a.EnrollmentId == enr.EnrollmentId)
                    .OrderByDescending(a => a.ExamAttemptId)
                    .FirstOrDefaultAsync();

                result.Add(new
                {
                    enr.EnrollmentId,
                    enr.ExamId,
                    Title = enr.Exam.Title,
                    DurationInMinutes = enr.Exam.DurationInMinutes,
                    TotalMarks = enr.Exam.TotalMarks,
                    enr.Exam.StartTime,
                    enr.Exam.EndTime,

                    // attempt status
                    IsCompleted = lastAttempt?.IsCompleted ?? false,
                    IsEvaluated = lastAttempt?.IsEvaluated ?? false,
                    Score = lastAttempt?.TotalScore ?? 0,
                    Passed = lastAttempt?.IsPassed ?? false
                });
            }

            return Ok(result);
        }

        // START ATTEMPT
        [HttpPost("start")]
        public async Task<IActionResult> StartAttempt(int enrollmentId)
        {
            var attempt = new ExamAttempt
            {
                EnrollmentId = enrollmentId,
                StartedAt = DateTime.UtcNow,
                IsCompleted = false,
                IsEvaluated = false
            };

            _context.ExamAttempts.Add(attempt);
            await _context.SaveChangesAsync();

            return Ok(attempt.ExamAttemptId);
        }

        // SUBMIT ALL ANSWERS
        public class SubmitAllDto
        {
            public int AttemptId { get; set; }
            public List<AnswerDto> Answers { get; set; }
        }

        public class AnswerDto
        {
            public int QuestionId { get; set; }
            public string AnswerText { get; set; }
        }

        [HttpPost("submit-all")]
        public async Task<IActionResult> SubmitAll([FromBody] SubmitAllDto model)
        {
            var attempt = await _context.ExamAttempts
                .FirstOrDefaultAsync(a => a.ExamAttemptId == model.AttemptId);

            if (attempt == null)
                return NotFound("Invalid attempt ID");

            foreach (var ans in model.Answers)
            {
                var question = await _context.Questions.FindAsync(ans.QuestionId);
                if (question == null) continue;

                bool? isCorrect = null;
                int? awardedMarks = null;

                if (question.IsMultipleChoice)
                {
                    isCorrect = ans.AnswerText == question.CorrectOption;
                    awardedMarks = isCorrect == true ? question.Marks : 0;
                }

                var existing = await _context.ExamAttemptAnswers
                    .FirstOrDefaultAsync(x =>
                        x.ExamAttemptId == attempt.ExamAttemptId &&
                        x.QuestionId == ans.QuestionId);

                if (existing == null)
                {
                    _context.ExamAttemptAnswers.Add(new ExamAttemptAnswer
                    {
                        ExamAttemptId = attempt.ExamAttemptId,
                        QuestionId = ans.QuestionId,
                        AnswerText = ans.AnswerText,
                        AwardedMarks = awardedMarks,
                        IsCorrect = isCorrect
                    });
                }
                else
                {
                    existing.AnswerText = ans.AnswerText;
                    existing.AwardedMarks = awardedMarks;
                    existing.IsCorrect = isCorrect;
                }
            }

            await _context.SaveChangesAsync();
            return Ok("Saved");
        }

        // COMPLETE ATTEMPT (AUTO MCQ GRADING)
        [HttpPost("complete-attempt/{attemptId}")]
        public async Task<IActionResult> CompleteAttempt(int attemptId)
        {
            var attempt = await _context.ExamAttempts
                .Include(a => a.Enrollment)
                    .ThenInclude(e => e.Exam)
                .Include(a => a.Answers)
                .FirstOrDefaultAsync(a => a.ExamAttemptId == attemptId);

            if (attempt == null)
                return NotFound("Attempt not found");
            int total = attempt.Answers
                .Where(a => a.AwardedMarks.HasValue)
                .Sum(a => a.AwardedMarks.Value);

            attempt.TotalScore = total;
            attempt.CompletedAt = DateTime.UtcNow;
            attempt.IsCompleted = true;

            // pass calculation
            var exam = attempt.Enrollment.Exam;
            decimal requiredMarks = (exam.TotalMarks * exam.PassPercentage) / 100m;

            attempt.IsPassed = total >= requiredMarks;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                attempt.ExamAttemptId,
                attempt.TotalScore,
                attempt.IsPassed,
                RequiredMarks = requiredMarks
            });
        }
        // USER RESULT LIST
        [HttpGet("my-attempts/{userId}")]
        public async Task<IActionResult> GetMyAttempts(int userId)
        {
            var attempts = await _context.ExamAttempts
                .Include(a => a.Enrollment)
                    .ThenInclude(e => e.User)
                .Include(a => a.Enrollment)
                    .ThenInclude(e => e.Exam)
                .Where(a => a.Enrollment.UserId == userId)
                .ToListAsync();

            var result = attempts.Select(a => new
            {
                a.ExamAttemptId,
                a.EnrollmentId,
                ExamTitle = a.Enrollment.Exam.Title,
                a.StartedAt,
                a.CompletedAt,
                a.TotalScore,
                a.IsPassed,
                a.IsCompleted,
                a.IsEvaluated
            });

            return Ok(result);
        }

        // Returns attempt details including questions, user answers, awarded marks, correct option
        [HttpGet("attempt/{attemptId}")]
        public async Task<IActionResult> GetAttemptDetailForUser(int attemptId)
        {
            var attempt = await _context.ExamAttempts
                .Include(a => a.Enrollment)
                    .ThenInclude(e => e.Exam)
                .Include(a => a.Answers)
                    .ThenInclude(ans => ans.Question)
                .FirstOrDefaultAsync(a => a.ExamAttemptId == attemptId);

            if (attempt == null)
                return NotFound("Attempt not found");

            var result = new
            {
                AttemptId = attempt.ExamAttemptId,
                ExamTitle = attempt.Enrollment.Exam.Title,
                attempt.StartedAt,
                attempt.CompletedAt,
                attempt.IsCompleted,
                attempt.IsEvaluated,
                attempt.TotalScore,
                attempt.IsPassed,
                Questions = attempt.Answers.Select(a => new
                {
                    a.ExamAttemptAnswerId,
                    a.QuestionId,
                    QuestionText = a.Question.QuestionText,
                    a.Question.IsMultipleChoice,
                    a.Question.OptionA,
                    a.Question.OptionB,
                    a.Question.OptionC,
                    a.Question.OptionD,
                    CorrectOption = a.Question.CorrectOption,
                    QuestionMarks = a.Question.Marks,
                    UserAnswer = a.AnswerText,
                    AwardedMarks = a.AwardedMarks,
                    a.IsCorrect
                }).ToList()
            };

            return Ok(result);
        }

    }
}
