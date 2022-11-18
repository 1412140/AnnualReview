using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;
using System.Security.Principal;
using AnnualReview.Models;
using System.Data.Entity;

namespace AnnualReview
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            //Database.SetInitializer<MasterContactListEntities>(null);
        }

        //public override void Init()
        //{
        //    this.PostAuthenticateRequest += MvcApplication_PostAuthenticateRequest;
        //    base.Init();
        //}

        //void MvcApplication_PostAuthenticateRequest(object sender, EventArgs e)
        //{
        //    var authCookie = HttpContext.Current.Request.Cookies[FormsAuthentication.FormsCookieName];
        //    if (authCookie != null)
        //    {
        //        string encTicket = authCookie.Value;
        //        if (!String.IsNullOrEmpty(encTicket))
        //        {
        //            var ticket = FormsAuthentication.Decrypt(encTicket);
        //            var id = new UserIdentity(ticket);
        //            var userRoles = Roles.GetRolesForUser(id.Name);
        //            var prin = new GenericPrincipal(id, userRoles);
        //            HttpContext.Current.User = prin;
        //        }
        //    }
        //}

       //protected void Application_PostAuthenticateRequest(Object sender, EventArgs e)
       //{
       //    var authCookie = System.Web.HttpContext.Current.Request.Cookies[FormsAuthentication.FormsCookieName];
       //    if (authCookie != null)
       //    {
       //        FormsAuthenticationTicket authTicket = FormsAuthentication.Decrypt(authCookie.Value);
       //        if (authTicket != null && !authTicket.Expired)
       //        {
       //            var roles = authTicket.UserData.Split(',');
       //            System.Web.HttpContext.Current.User = new System.Security.Principal.GenericPrincipal(new FormsIdentity(authTicket), roles);
       //        }
       //    }
       //}
    }
}
