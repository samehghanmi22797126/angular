using System.Collections.Generic;

namespace sale_sport.Services
{
    public class AccountService : IAccountService
    {
        public IEnumerable<string> GetAllAccountNames()
        {
            // Implémentation minimale pour compiler ; remplacez par la logique réelle.
            return new[] { "admin", "coach", "member" };
        }
    }
}