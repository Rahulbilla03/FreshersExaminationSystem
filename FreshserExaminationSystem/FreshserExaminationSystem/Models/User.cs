using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FreshserExaminationSystem.Models
{
    public class User
    {
        [JsonIgnore]
        public int Id { get; set; }
        public string Username { get; set; }
        [EmailAddress]
        public string Email { get; set; }
        [MaxLength(10)]
        public string Password { get; set; }
        public bool IsAdmin { get; set; }=false;

        public string Role
        {
            get
            {
                return IsAdmin ? "Admin" : "User";
            }
        }
        [JsonIgnore]
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        [JsonIgnore]
        public ICollection<ExamAttempt> ExamAttempts { get; set; } = new List<ExamAttempt>();
    }
}
