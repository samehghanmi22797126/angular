using System.Collections.Generic;

namespace sale_sport.Services
{
    public interface IAccountService
    {
        IEnumerable<string> GetAllAccountNames();
    }
}