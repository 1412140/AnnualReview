using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(AnnualReview.Startup))]
namespace AnnualReview
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
