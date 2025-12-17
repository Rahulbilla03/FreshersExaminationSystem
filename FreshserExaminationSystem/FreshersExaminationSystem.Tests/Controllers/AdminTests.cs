using FreshserExaminationSystem.Controllers;
using FreshserExaminationSystem.Database;
using FreshserExaminationSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace FreshersExaminationSystem.Tests.Controllers
{
    public class AdminTests
    {
        private readonly ApplicationDbContext _context;
        private readonly AdminController _controller;

        public AdminTests()
        {
            _context = GetDbContext();
            _controller = new AdminController(_context);
        }

        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task CreateUser_ShouldSaveUser()
        {
            var user = new User
            {
                Username = "testuser",
                Email = "test@test.com",
                Password = "1234"
            };

            var result = await _controller.CreateUser(user);

            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(1, _context.Users.Count());
        }

        [Fact]
        public async Task CreateExam_ShouldSetIsPublishedFalse()
        {
            var exam = new Exam
            {
                Title = "Sample Exam",
                TotalMarks = 100,
                PassPercentage = 40
            };

            var result = await _controller.CreateExam(exam);

            var ok = Assert.IsType<OkObjectResult>(result);
            var savedExam = Assert.IsType<Exam>(ok.Value);

            Assert.False(savedExam.IsPublished);
        }


        [Fact]
        public async Task AddQuestions_ShouldAddQuestions()
        {
            var questions = new List<Question>
            {
                new Question
                {
                    QuestionText = "2 + 2 = ?",
                    IsMultipleChoice = true,
                    OptionA = "3",
                    OptionB = "4",
                    CorrectOption = "B",
                    Marks = 1,
                    ExamId = 1
                }
            };

            var result = await _controller.AddQuestions(questions);

            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(1, _context.Questions.Count());
        }

        [Fact]
        public async Task EvaluateAttempt_ShouldEvaluateAndPass()
        {
            var exam = new Exam
            {
                Title = "Unit Test Exam",
                TotalMarks = 100,
                PassPercentage = 50
            };

            var user = new User
            {
                Username = "student1",
                Email = "student@test.com",
                Password = "1234"
            };

            var enrollment = new Enrollment
            {
                User = user,
                Exam = exam
            };

            var question = new Question
            {
                QuestionText = "Sample MCQ question",
                IsMultipleChoice = true,
                CorrectOption = "A",
                Marks = 50
            };

            var answer = new ExamAttemptAnswer
            {
                Question = question,
                AnswerText = "A",
                AwardedMarks = 50  
            };

            var attempt = new ExamAttempt
            {
                Enrollment = enrollment,
                Answers = new List<ExamAttemptAnswer> { answer }
            };

            _context.ExamAttempts.Add(attempt);
            await _context.SaveChangesAsync();

            var result = await _controller.EvaluateAttempt(
                attempt.ExamAttemptId,
                new List<AdminController.EvaluatedAnswer>()
            );

            Assert.IsType<OkObjectResult>(result);
            Assert.True(attempt.IsEvaluated);
            Assert.True(attempt.IsPassed);
            Assert.Equal(50m, attempt.TotalScore);
        }



    }
}
