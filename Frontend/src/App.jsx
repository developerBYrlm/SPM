import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

//-------------------------------------------------------------------------------------------------------------------------------------------

import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBaseRoutes from "./utils/RoleBaseRoutes";

//-------------------------------------------------------------------------------------------------------------------------------------------

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

//-------------------------------------------------------------------------------------------------------------------------------------------

import AuthorityDashboard from "./pages/AuthorityDashboard";

import AuthoritySummary from "./components/Dashboard/AuthoritySummary";

import RoutineUpSh from "./components/Dashboard/RoutineUpSh";

import ApplicationApprove from "./components/Dashboard/Application/ApplicationApprove";
import ApplicationPending from "./components/Dashboard/Application/ApplicationPending";
import ApplicationReject from "./components/Dashboard/Application/ApplicationReject";

import Add from "./components/Dashboard/Add";
import AuthorityProfile from "./components/Dashboard/authorityProfile";
import AuthorityProfileUpdate from "./components/Dashboard/AuthorityProfileUpdate";
import ApplicationList from "./components/Dashboard/ApplicationList";

import Slist from "./components/Dashboard/List";   
import Flist from "./components/Dashboard/Flist";
import Alist from "./components/Dashboard/Alist";

import SActionButton from "./components/Dashboard/ViewActionButton/SActionButton";
import FActionButton from "./components/Dashboard/ViewActionButton/FActionButton";
import AActionButton from "./components/Dashboard/ViewActionButton/AActionButton";

import EditStudent from "./components/Dashboard/EditActionButton/EditStudent";
import EditFaculty from "./components/Dashboard/EditActionButton/EditFaculty";
import EditACAD from "./components/Dashboard/EditActionButton/EditACAD";


//-------------------------------------------------------------------------------------------------------------------------------------------


import StudentDashboard from "./pages/StudentDashboard";
import StudentApplication from "./components/student/StudentApplication";
import StudentApplicationForm from "./components/student/StudentApplicationForm";
import StudentProfile from "./components/student/StudentProfile"; 
import StudentProfileUpdate from "./components/student/StudentProfileUpdate";
import MyApplication from "./components/student/MyApplication";
import UpdateStudentApplications from "./components/student/UpdateStudentApplications";
import StudentFacultyView from "./components/student/StudentFacultyView";



//-------------------------------------------------------------------------------------------------------------------------------------------


import FacultyDashboard from "./pages/FacultyDashboard";
import FacultyStudentView from "./components/faculty/FacultyStudentView";
import FacultyList from "./components/faculty/facultyList";
import StudentProfileView from "./components/faculty/StudentProfileView";
import FacultyProfile from "./components/faculty/FacultyProfile";
import FacultyProfileUpdate from "./components/faculty/FacultyProfileUpdate";
import StudentFacultyApplicationList from "./components/faculty/StudentFacultyApplicationList";
import FacultyApplicationView from "./components/faculty/FacultyApplicationView";

import FApprove from "./components/faculty/FacultyApplication/FApprove";
import Fpending from "./components/faculty/FacultyApplication/Fpending";
import FRejcted from "./components/faculty/FacultyApplication/FRejcted";

import RoutineFacultySh from "./components/faculty/RoutineFacultySh";

//-------------------------------------------------------------------------------------------------------------------------------------------


import ACADDashboard from "./pages/acadDashboard";
import ACADStudentView from "./components/ACAD/ACADStudentView";
import ACADProfile from "./components/ACAD/ACADProfile"; 
import ACADProfileUpdate from "./components/ACAD/ACADProfileUpdate";
import ApplicationView from "./components/Dashboard/ViewActionButton/ApplicationView";
import StudentACADApplicationList from "./components/ACAD/StudentACADApplicationList";
import ACADApplicationView from "./components/ACAD/ACADApplicationView";
import AApprove from "./components/ACAD/ACADApplication/AApprove";
import APending from "./components/ACAD/ACADApplication/APending";
import ARejected from "./components/ACAD/ACADApplication/ARejected";





//-------------------------------------------------------------------------------------------------------------------------------------------

 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />

        <Route path="/authority-dashboard" element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRole={["authority"]}>
              <AuthorityDashboard/>
            </RoleBaseRoutes>
          </PrivateRoutes>         
        }>
          <Route index element={<AuthoritySummary />} />
          <Route path="add-users" element={<Add />} />
          <Route path="students-routine" element={<RoutineUpSh />} />

          <Route path="students-applications-approve" element={<ApplicationApprove />} />
          <Route path="students-applications-pending" element={<ApplicationPending/>} />
          <Route path="students-applications-rejected" element={<ApplicationReject />} />

          <Route path="authority-profile/:id" element={<AuthorityProfile />} />
          <Route path="authority-profile-update/:id" element={<AuthorityProfileUpdate />} />
          <Route path="students-applications" element={<ApplicationList/>} />
          <Route path="application/application-view/:id" element={<ApplicationView />} />
          
          <Route path="students" element={<Slist />} />
          <Route path="students/view/:id" element={<SActionButton />} />
          <Route path="students/edit/:id" element={<EditStudent />} />

          <Route path="faculty" element={<Flist />} />
          <Route path="faculty/faculty-view/:id" element={<FActionButton />} />
          <Route path="faculty/faculty-edit/:id" element={<EditFaculty />} />

          <Route path="acad" element={<Alist />} />
          <Route path="acad/acad-view/:id" element={<AActionButton />} />
          <Route path="acad/acad-edit/:id" element={<EditACAD />} />
        </Route>



//-------------------------------------------------------------------------------------------------------------------------------------------
        <Route path="/student-dashboard" element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRole={["student"]}>
              <StudentDashboard/>
            </RoleBaseRoutes>
          </PrivateRoutes>  
        }>
          <Route index element={<StudentApplication />} />
          <Route path="new-application" element={<StudentApplicationForm />} />
          <Route path="update-application" element={<UpdateStudentApplications/>} />
          <Route path="current-application" element={<MyApplication />} />
          <Route path="student-profile/:id" element={<StudentProfile/>} />
          <Route path="student-profile-update/:id" element={<StudentProfileUpdate />} />
          <Route path="student-faculty-view" element={<StudentFacultyView />} />
          
        </Route>

//-------------------------------------------------------------------------------------------------------------------------------------------        
        <Route path="/faculty-dashboard" element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRole={["faculty"]}>
              <FacultyDashboard />
            </RoleBaseRoutes> 
          </PrivateRoutes>
        }> 
          <Route index element={<FacultyStudentView />} />
          <Route path="students" element={<FacultyList />} />
          <Route path="students/view/:id" element={<StudentProfileView />} />
          <Route path="students-faculty-applications" element={<StudentFacultyApplicationList />} />
          <Route path="application/application-view/:id" element={<FacultyApplicationView />} />
          <Route path="faculty-profile/:id" element={<FacultyProfile />} />
          <Route path="faculty-profile-update/:id" element={<FacultyProfileUpdate />} />
          
          <Route path="students-applications-approve" element={<FApprove />} />
          <Route path="students-applications-pending" element={<Fpending />} />
          <Route path="students-applications-rejected" element={<FRejcted />} />
          <Route path="student-routine-view-faculty" element={<RoutineFacultySh />} />
        </Route>

//-------------------------------------------------------------------------------------------------------------------------------------------        
        <Route path="/acad-dashboard" element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRole={["ACAD"]}>
              <ACADDashboard />
            </RoleBaseRoutes>
          </PrivateRoutes>
        }>
          <Route index element={<ACADStudentView />} />
          <Route path="students-acad-applications" element={<StudentACADApplicationList/>} />
          <Route path="application/application-view/:id" element={<ACADApplicationView />} />
          <Route path="acad-profile/:id" element={<ACADProfile />} />
          <Route path="acad-profile-update/:id" element={<ACADProfileUpdate />} />

          <Route path="students-applications-approve" element={<AApprove />} />
          <Route path="students-applications-pending" element={<APending />} />
          <Route path="students-applications-rejected" element={<ARejected />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
