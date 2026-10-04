import Timetable from "../shared/Timetable.jsx";

export default function TeacherTimetablePage({ admin }) {
  return <Timetable canEdit={!!admin} />;
}
