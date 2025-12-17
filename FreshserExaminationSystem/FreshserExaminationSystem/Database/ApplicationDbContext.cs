using FreshserExaminationSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace FreshserExaminationSystem.Database
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Exam> Exams { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<ExamAttempt> ExamAttempts { get; set; }
        public DbSet<ExamAttemptAnswer> ExamAttemptAnswers { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // USER -> ENROLLMENTS
            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.User)
                .WithMany(u => u.Enrollments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // EXAM -> ENROLLMENTS
            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.Exam)
                .WithMany(ex => ex.Enrollments)
                .HasForeignKey(e => e.ExamId)
                .OnDelete(DeleteBehavior.Restrict);

            // EXAM -> QUESTIONS
            modelBuilder.Entity<Question>()
                .HasOne(q => q.Exam)
                .WithMany(ex => ex.Questions)
                .HasForeignKey(q => q.ExamId)
                .OnDelete(DeleteBehavior.Cascade);

            // ENROLLMENT -> EXAMATTEMPT
            modelBuilder.Entity<ExamAttempt>()
                .HasOne(a => a.Enrollment)
                .WithMany(e => e.Attempts)
                .HasForeignKey(a => a.EnrollmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // EXAMATTEMPT -> ANSWERS
            modelBuilder.Entity<ExamAttemptAnswer>()
                .HasOne(ans => ans.ExamAttempt)
                .WithMany(a => a.Answers)
                .HasForeignKey(ans => ans.ExamAttemptId)
                .OnDelete(DeleteBehavior.Cascade);

            // QUESTION -> EXAMATTEMPTANSWER
            modelBuilder.Entity<ExamAttemptAnswer>()
                .HasOne(ans => ans.Question)
                .WithMany()
                .HasForeignKey(ans => ans.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            // Decimal precision for %  
            modelBuilder.Entity<Exam>()
                .Property(e => e.PassPercentage)
                .HasPrecision(5, 2);

            // SEED ADMIN USER
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                Username = "Rahul",
                Email = "rahul@gmail.com",
                Password = "Rahul123",
                IsAdmin = true
            });
        }
    }
}
