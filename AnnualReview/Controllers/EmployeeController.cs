using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System.Data;
using System.Data.SqlClient;
using AnnualReview.Models;

namespace AnnualReview.Controllers
{
    public class EmployeeController : Controller
    {
        public MasterContactListEntities db = new MasterContactListEntities();
        String strConnString = System.Configuration.ConfigurationManager.ConnectionStrings["MasterContactList"].ConnectionString;
        SqlConnection con;
        //  [Authorize]
        public ActionResult Index()
        {
            if (Request.IsAuthenticated)
            {
                EmployeePerformanceReview eModel = db.EmployeePerformanceReviews.Find(Int16.Parse(RouteData.Values["id"].ToString()));
                Session["UserID"] = eModel.EmployeeID;

                return View(eModel);
            }
            return RedirectToAction("Login", "Account");
        }

        public JsonResult getInitData(string id, string managerId)
        {
            // connect string call procedure
           

            //get Info User is Loggin
            var empInfoData = (from rw in db.spAnnualPR_GetImageByEID(id)
                               select new
                               {
                                   EmployeeID = Convert.ToString(rw.EmployeeID),
                                   FullName = Convert.ToString(rw.FullName),
                                   Position = Convert.ToString(rw.Position),
                                   LevelName = Convert.ToInt16(rw.LevelName),
                                   DepartmentID = Convert.ToString(rw.DepartmentID),
                                   EmployeeImage = String.Format("data:image/jpg;base64,{0}", Convert.ToBase64String((byte[])(rw.EmployeeImage)))
                               }).ToList().FirstOrDefault();



            // get Employee List
            var empList = (from rw in db.spAnnualPR_SearchImageByEID_Test(id)
                           select new EmployeeModel
                           {
                               StaffEID = Convert.ToString(rw.StaffEID),
                               FullName = Convert.ToString(rw.FullName),
                               Position = Convert.ToString(rw.Position),
                               Department = Convert.ToString(rw.Department),
                               //EmployeeImage = String.Format("data:image/jpg;base64,{0}", Convert.ToBase64String((byte[])(rw.EmployeeImage)))
                           }).ToList();


            //get Manager List
            spAnnualPR_ListManagers_Test_Result manaModel = new spAnnualPR_ListManagers_Test_Result();
            ManagerPerformanceReview mModel = new ManagerPerformanceReview();
            bool isReviewed = false;
            bool isSaved = false;
            bool isSubmited = false;
            if (managerId != null && managerId != "")
            {
                manaModel = db.spAnnualPR_ListManagers_Test(id).ToList().FirstOrDefault(obj => obj.EmployeeID == managerId);
            }
            else
            {
                mModel = db.ManagerPerformanceReviews.FirstOrDefault(obj => obj.StaffEID == id);
                if (mModel != null)
                {
                    isReviewed = Convert.ToBoolean(mModel.isReviewed);
                    isSubmited = Convert.ToBoolean(mModel.isSubmited);
                    isSaved = Convert.ToBoolean(mModel.isSaved);
                    manaModel = new spAnnualPR_ListManagers_Test_Result();
                    EmployeePerformanceReview employeeInfo = db.EmployeePerformanceReviews.FirstOrDefault(obj => obj.EmployeeID == mModel.ManagerEID);
                    manaModel.EmployeeID = employeeInfo.EmployeeID;
                    manaModel.FullName = employeeInfo.FullName;
                    manaModel.Position = employeeInfo.Position;
                }
                else
                {
                    mModel = new ManagerPerformanceReview();
                }
            }

            //get Department Name
            Department dModel = db.Departments.FirstOrDefault(obj => obj.DepartmentCode == empInfoData.DepartmentID);
            string departmentName = "";
            if (dModel != null)
            {
                departmentName = dModel.DepartmentName;
            }

            //get PerformanceReviewDetail
            PerformanceReviewDetail pModel = db.PerformanceReviewDetails.FirstOrDefault(obj => obj.EmployeeID == id);
            if (pModel == null)
            {
                pModel = new PerformanceReviewDetail();
            }

            bool isManager = empList.Count > 0 ? true : false;
            var infoOther = new
            {
                isReviewed = isReviewed,
                isSubmited = isSubmited,
                isSaved = isSaved,
                isManager = isManager,
                signDateM = mModel.UpdatedTime,
                departName = departmentName,
                managerEID = manaModel.EmployeeID,
                level = db.EmployeePerformanceReviews.FirstOrDefault(obj => obj.EmployeeID == id)?.LevelName,
                levelManger = db.EmployeePerformanceReviews.FirstOrDefault(obj => obj.EmployeeID == managerId)?.LevelName
            };

            var result = new { empData = empInfoData, infoOther = infoOther, managerModel = manaModel, revDetail = pModel, empList = empList };
            var jsonResult = Json(result, JsonRequestBehavior.AllowGet);
            jsonResult.MaxJsonLength = int.MaxValue;
            return jsonResult;
        }

        [HttpPost]
        public JsonResult openReviewed(string empId)
        {
            //get PerformanceReviewDetail
            PerformanceReviewDetail pModel = db.PerformanceReviewDetails.FirstOrDefault(obj => obj.EmployeeID == empId);
            
            if (pModel == null)
            {
                pModel = new PerformanceReviewDetail();
            }


          //  var result = new { managerName = managerName, data = pModel };
            return Json(pModel, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult getDetailEmp(string empId)
        {
           spAnnualPR_GetImageByEID_Test_Result empInfoData = db.spAnnualPR_GetImageByEID_Test(empId).FirstOrDefault();
            empInfoData.Img = String.Format("data:image/jpg;base64,{0}", Convert.ToBase64String((byte[])(empInfoData.EmployeeImage)));


            return Json(empInfoData, JsonRequestBehavior.AllowGet);
        }

        public JsonResult getManagerInfo(string id, string manaId)
        {
            spAnnualPR_ListManagers_Test_Result manaModel = new spAnnualPR_ListManagers_Test_Result();
            manaModel = db.spAnnualPR_ListManagers_Test(id).ToList().FirstOrDefault(obj => obj.EmployeeID == manaId);
            if (manaModel == null)
            {
                manaModel = new spAnnualPR_ListManagers_Test_Result();
            }
            return Json(manaModel, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        //public JsonResult sendStaffReview([Bind(Include = "EmployeeID,SelfEvaluation,StaffPerformanceSummary,StaffGoals,StaffComments, ")] PerformanceReviewDetail reviewModel)
        public JsonResult saveStaffReview(string EmployeeID, string SelfEvaluation, string StaffPerformanceSummary, string StaffGoals, string StaffComments, string ManagerId, string empSign, bool isSubmit)
        {
            PerformanceReviewDetail revDetailModel = db.PerformanceReviewDetails.FirstOrDefault(obj => obj.EmployeeID == EmployeeID);
            ManagerPerformanceReview manaModel = db.ManagerPerformanceReviews.FirstOrDefault(obj => obj.StaffEID == EmployeeID);

            if (revDetailModel == null)
            {
                revDetailModel = new PerformanceReviewDetail();
                revDetailModel.EmployeeID = EmployeeID;
                revDetailModel.SelfEvaluation = SelfEvaluation;
                revDetailModel.StaffPerformanceSummary = StaffPerformanceSummary;
                revDetailModel.StaffGoals = StaffGoals;
                revDetailModel.StaffComments = StaffComments;
                revDetailModel.Signature = empSign;
                revDetailModel.CreatedTime = DateTime.Now;
                revDetailModel.UpdatedTime = DateTime.Now;

                
                if (manaModel == null)
                {
                    manaModel = new ManagerPerformanceReview();
                    manaModel.StaffEID = EmployeeID;
                    manaModel.ManagerEID = ManagerId;
                    manaModel.isSubmited = isSubmit;
                    manaModel.isSaved = true;
                    manaModel.CreatedTime = DateTime.Now;
                    manaModel.UpdatedTime = DateTime.Now;
                    db.ManagerPerformanceReviews.Add(manaModel);
                }
                else
                {
                    manaModel.StaffEID = EmployeeID;
                    manaModel.ManagerEID = ManagerId;
                    manaModel.isSubmited = isSubmit;
                }

                db.PerformanceReviewDetails.Add(revDetailModel);

            }
            else
            {
                revDetailModel.SelfEvaluation = SelfEvaluation;
                revDetailModel.StaffPerformanceSummary = StaffPerformanceSummary;
                revDetailModel.StaffGoals = StaffGoals;
                revDetailModel.StaffComments = StaffComments;
                revDetailModel.Signature = empSign;

                if (manaModel.ManagerEID != ManagerId)
                {
                    manaModel.ManagerEID = ManagerId;
                }
                manaModel.isSubmited = isSubmit;
            }
            
            //write log
            writeReviewLog(revDetailModel.ID);
            db.SaveChanges();

            return Json(manaModel, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult delEmployee(string id)
        {

            var resultModel = db.ManagerPerformanceReviews.FirstOrDefault(x => x.StaffEID == id);

            if (resultModel != null)
            {
                resultModel.isShown = false;
                db.SaveChanges();
            }
            return Json("Success", JsonRequestBehavior.AllowGet);
        }

        public JsonResult updStatusReview(string mode, string empID, string manaEID)
        {
            ManagerPerformanceReview mModel = db.ManagerPerformanceReviews.FirstOrDefault(obj => obj.StaffEID == empID);
            if (mModel != null)
            {
                if (mode == "on")
                {
                    mModel.isReviewed = true;

                }
                else
                {
                    mModel.isReviewed = false;
                }
                mModel.UpdatedTime = DateTime.Now;
                db.SaveChanges();

                return Json("Fail", JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json("Success", JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult changeSubmit(string EmployeeID)
        {
            ManagerPerformanceReview mModel = db.ManagerPerformanceReviews.FirstOrDefault(obj => obj.StaffEID == EmployeeID);
            mModel.isSubmited = false;
            db.SaveChanges();
            return Json("Success", JsonRequestBehavior.AllowGet);
        }


        //Save datta Manager Review
        [HttpPost]
        public JsonResult saveReview([Bind(Include = "EmployeeID,ManagerAssessment,ManagerPerformanceSummary,Criteria1,Criteria2,Criteria3,Criteria4,Criteria5,Criteria6,Criteria7,Criteria8,Criteria9,Criteria10,Criteria11,Criteria12,Criteria13,Criteria14,Criteria15,ManagerSignature ")] PerformanceReviewDetail reviewModel)
        {
            PerformanceReviewDetail rModel = db.PerformanceReviewDetails.FirstOrDefault(obj => obj.EmployeeID == reviewModel.EmployeeID);
            EmployeePerformanceReview eModel = db.EmployeePerformanceReviews.FirstOrDefault(obj => obj.EmployeeID == reviewModel.EmployeeID);
            PerformanceReviewEditLog logModel = new PerformanceReviewEditLog();
            if (rModel == null)
            {
                reviewModel.CreatedTime = DateTime.Now;
                reviewModel.UpdatedTime = DateTime.Now;
                rModel = new PerformanceReviewDetail();
                rModel = reviewModel;
                db.PerformanceReviewDetails.Add(rModel);
            }
            else
            {
                rModel.ManagerAssessment = reviewModel.ManagerAssessment;
                rModel.ManagerPerformanceSummary = reviewModel.ManagerPerformanceSummary;
                if (eModel.LevelName >= 3)
                {
                    rModel.Criteria1 = reviewModel.Criteria1;
                    rModel.Criteria2 = reviewModel.Criteria2;
                    rModel.Criteria3 = reviewModel.Criteria3;
                    rModel.Criteria4 = reviewModel.Criteria4;
                    rModel.Criteria5 = reviewModel.Criteria5;
                    rModel.Criteria6 = reviewModel.Criteria6;
                    rModel.Criteria7 = reviewModel.Criteria7;
                    rModel.Criteria8 = reviewModel.Criteria8;
                    rModel.Criteria9 = reviewModel.Criteria9;
                    rModel.Criteria10 = reviewModel.Criteria10;
                    rModel.Criteria11 = reviewModel.Criteria11;
                }
                else
                {
                    rModel.Criteria12 = reviewModel.Criteria12;
                    rModel.Criteria13 = reviewModel.Criteria13;
                    rModel.Criteria14 = reviewModel.Criteria14;
                    rModel.Criteria15 = reviewModel.Criteria15;
                }
                rModel.ManagerSignature = reviewModel.ManagerSignature;
                rModel.UpdatedTime = DateTime.Now;
            }
            //write log
            writeReviewLog(rModel.ID);
            db.SaveChanges();

            return Json("Success", JsonRequestBehavior.AllowGet);
        }

        public void writeReviewLog(int reviewId)
        {
            PerformanceReviewEditLog logModel = new PerformanceReviewEditLog();
            logModel.ReviewID = reviewId;
            logModel.EditorID = Session["UserID"].ToString();
            logModel.HostName = System.Environment.MachineName;
            logModel.UpdatedTime = DateTime.Now;
            db.PerformanceReviewEditLogs.Add(logModel);
        }

        public JsonResult getLogData(string empid)
        {
            var result = (from rw in db.spAnnualPR_getInfoLogByEID(empid)
                            select new 
                            {
                                FullName = Convert.ToString(rw.FullName),
                                UpdatedTime = Convert.ToString(rw.UpdatedTime),
                            }).ToList();

            
            return Json(result, JsonRequestBehavior.AllowGet);
        }
    }

    
}
