import type { Course, ScheduleData, Weekday } from '@shared/types/schedule'
import { createCourse, getTodayWeekday } from '@shared/types/schedule'

const KEY = 'schedule_data'

export function getSchedule(): ScheduleData {
  const data = localStorage.getItem(KEY)
  if (data) return JSON.parse(data)
  return { courses: [], updatedAt: 0, semester: '' }
}

export function getCourses(): Course[] {
  return getSchedule().courses
}

export function saveCourses(courses: Course[], semester: string = ''): void {
  const schedule: ScheduleData = {
    courses,
    updatedAt: Date.now(),
    semester
  }
  localStorage.setItem(KEY, JSON.stringify(schedule))
  window.dispatchEvent(new Event('storage-updated'))
}

export function addCourse(
  name: string,
  weekday: Weekday,
  startSection: number,
  endSection: number,
  location: string = '',
  teacher: string = '',
  weeks: string = '1-16周'
): Course {
  const courses = getCourses()
  const course = createCourse(name, weekday, startSection, endSection, location, teacher, weeks)
  courses.push(course)
  saveCourses(courses, getSchedule().semester)
  return course
}

export function updateCourse(id: string, updates: Partial<Course>): void {
  const courses = getCourses()
  const item = courses.find(c => c.id === id)
  if (item) {
    Object.assign(item, updates)
    saveCourses(courses, getSchedule().semester)
  }
}

export function deleteCourse(id: string): void {
  saveCourses(getCourses().filter(c => c.id !== id), getSchedule().semester)
}

export function clearSchedule(): void {
  saveCourses([], '')
}

export function getCoursesByWeekday(weekday: Weekday): Course[] {
  return getCourses()
    .filter(c => c.weekday === weekday)
    .sort((a, b) => a.startSection - b.startSection)
}

export function getTodayCourses(): Course[] {

  return getCoursesByWeekday(getTodayWeekday())
}

export function getScheduleStats() {
  const courses = getCourses()
  const weekdays = new Set(courses.map(c => c.weekday))
  return {
    total: courses.length,
    weekdays: weekdays.size,
    today: getTodayCoursesStatic().length
  }
}

function getTodayCoursesStatic(): Course[] {
  return getCoursesByWeekday(getTodayWeekday())
}

export function getSemester(): string {
  return getSchedule().semester
}

export function setSemester(semester: string): void {
  const schedule = getSchedule()
  schedule.semester = semester
  schedule.updatedAt = Date.now()
  localStorage.setItem(KEY, JSON.stringify(schedule))
  window.dispatchEvent(new Event('storage-updated'))
}