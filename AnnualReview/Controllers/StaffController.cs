using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Runtime.Serialization.Formatters.Binary;

using System.IO;
using System.Collections;
using System.Runtime.Serialization;
using System.Drawing;

namespace AnnualReview.Controllers
{
    public class StaffController : Controller
    {
        // GET: Manager
        public MasterContactListEntities db = new MasterContactListEntities();
        // GET: Manager
        public ActionResult Index()
        {
            if (Request.IsAuthenticated)
            {
                //Is level 1, 2 accesss
                EmployeePerformanceReview eModel = db.EmployeePerformanceReviews.Find(Int16.Parse(RouteData.Values["id"].ToString()));
                
                return View(eModel);
            }
            return RedirectToAction("Login", "Account");
        }

        public JsonResult getInitData(string managerEID)
        {
            //var result = (from maReview in db.ManagerPerformanceReviews
            //              join emReview in db.EmployeePerformanceReviews on maReview.StaffEID equals emReview.EmployeeID
            //              where maReview.ManagerEID == managerEID && maReview.isShown != false
            //              orderby emReview.EmployeeID ascending
            //              select new
            //              {
            //                  maReview.StaffEID,
            //                  maReview.isRequested,
            //                  maReview.isApproved,
            //                  maReview.isShown,
            //                  emReview.Position,
            //                  emReview.FullName
            //              }).ToList();

            EmployeePerformanceReview eModel = db.EmployeePerformanceReviews.SingleOrDefault(obj => obj.EmployeeID == managerEID);

            DataSet ds = new DataSet();

            String strConnString = System.Configuration.ConfigurationManager.ConnectionStrings["MasterContactList"].ConnectionString;


            SqlConnection con = new SqlConnection(strConnString);
            SqlDataAdapter sda = new SqlDataAdapter();
            SqlCommand cmd = new SqlCommand("spAnnualPR_SearchImageByEID");
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@DepartmentId", eModel.DepartmentID);
            cmd.Parameters.AddWithValue("@LevelName", eModel.LevelName);

            if (eModel.LevelName <=4)
            {
                cmd.Parameters.AddWithValue("@EmployeeID", managerEID);
            }else
            {
                cmd.Parameters.AddWithValue("@EmployeeID", DBNull.Value);
            }

            cmd.Connection = con;
            sda.SelectCommand = cmd;

            sda.Fill(ds);

            //List<Item> items = new List()
            //foreach (DataRow row in ds.Tables[0].Rows)
            //{
            //    List<T>

            //    d.DepartmentName = row["DepartmentName"].ToString();
            //    d.EmailAddress = row["EmailAddress"].ToString();
            //    d.Extension = row["Extension"].ToString();
            //    d.FirstName = row["FirstName"].ToString();
            //    d.FullName = row["FullName"].ToString();
            //    d.MobilePhone = row["MobilePhone"].ToString();
            //    Depts.Add(d);

            //}

            var result = (from rw in ds.Tables[0].AsEnumerable()
                                 select new 
                                 {
                                     StaffEID = Convert.ToString(rw["StaffEID"]),
                                     
                                     FullName = Convert.ToString(rw["FullName"]),
                                     Position = Convert.ToString(rw["Position"]),
                                     Department = Convert.ToString(rw["Department"]),
                                     EmployeeImage = String.Format("data:image/jpg;base64,{0}", Convert.ToBase64String((byte[])(rw["EmployeeImage"])))
                                 }).ToList();


            return Json(result, JsonRequestBehavior.AllowGet);
        }
        

        [HttpPost]
        public JsonResult saveReview([Bind(Include = "EmployeeID,ManagerAssessment,ManagerPerformanceSummary,Criteria12,Criteria13,Criteria14,Criteria15")] PerformanceReviewDetail reviewModel)
        {
            PerformanceReviewDetail rModel = db.PerformanceReviewDetails.SingleOrDefault(obj => obj.EmployeeID == reviewModel.EmployeeID);
            if (rModel == null)
            {
                reviewModel.CreatedTime = DateTime.Now;
                db.PerformanceReviewDetails.Add(reviewModel);
                db.SaveChanges();
            }
            else
            {
                rModel.ManagerAssessment = reviewModel.ManagerAssessment;
                rModel.ManagerPerformanceSummary = reviewModel.ManagerPerformanceSummary;
                rModel.Criteria12 = reviewModel.Criteria12;
                rModel.Criteria13 = reviewModel.Criteria13;
                rModel.Criteria14 = reviewModel.Criteria14;
                rModel.Criteria15 = reviewModel.Criteria15;
                db.SaveChanges();

            }

            return Json("Success", JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public JsonResult delEmployee(string id)
        {
            
            var resultModel = db.ManagerPerformanceReviews.SingleOrDefault(x => x.StaffEID == id);

            if (resultModel != null)
            {
                resultModel.isShown = false;
                db.SaveChanges();
            }
            return Json("Success", JsonRequestBehavior.AllowGet);
        }
    }
}