using FreshserExaminationSystem.Database;
using FreshserExaminationSystem.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FreshserExaminationSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class LoginController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        public LoginController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost]
        public async Task<IActionResult> login([FromBody] Login x)
        {
            if (x == null) return BadRequest();
            var d = _context.Users.Where(s => s.Id == x.Id && s.Password == x.password).FirstOrDefault();
            if (d == null) return BadRequest();
            else
            {
                var k = Encoding.ASCII.GetBytes(_config["keey"]);
                var tokenhandler = new JwtSecurityTokenHandler();
                var descriptor = new SecurityTokenDescriptor
                {
                    Subject = new System.Security.Claims.ClaimsIdentity(new Claim[]
                    {
                    new Claim(ClaimTypes.Name,d.Username),
                    new Claim(ClaimTypes.Role,d.Role),
                    new Claim("id",d.Id.ToString())
                    }),
                    Expires = DateTime.UtcNow.AddHours(4),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(k), SecurityAlgorithms.HmacSha512Signature)
                };
                var token = tokenhandler.CreateToken(descriptor);
                var tt = tokenhandler.WriteToken(token);
                return Ok(tt);
            }
        }
    }
}
