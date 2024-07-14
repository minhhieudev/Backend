const express = require('express');
const app = express();
const $ = require('../../middlewares/safe-call');
const db = require('../../models'); // Điều chỉnh đường dẫn đến models của bạn
const StatisticModel = db['statistic'];
const StudentModel = db['student'];

app.post("/", async (req, res) => {
  const data = req.body;
  console.log(data);

  if (data && data.user && data.schoolYear && data.semester) {
    try {
      // Sử dụng findOneAndUpdate với upsert
      const updatedDoc = await StatisticModel.findOneAndUpdate(
        { 
          user: data.user, 
          schoolYear: data.schoolYear, 
          semester: data.semester 
        }, // Điều kiện tìm kiếm
        data, // Dữ liệu để cập nhật
        { new: true, upsert: true, setDefaultsOnInsert: true } // Tùy chọn
      );

      return res.json({ success: true, doc: updatedDoc, status: 'success' });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, status: 'error', message: 'Lỗi máy chủ nội bộ' });
    }
  }

  return res.json({ success: false, status: 'error', message: 'Vui lòng cung cấp dữ liệu, người dùng, năm học và học kỳ.' });
});

app.get('/:semester/:schoolYear', async (req, res) => {
  try {
    const { semester, schoolYear } = req.params;

    // Lấy danh sách các lớp từ StudentModel
    const classNames = await StudentModel.distinct('className');

    const classPromises = classNames.map(async (className) => {
      // Lấy danh sách sinh viên từ StudentModel
      const studentsFromStudentModel = await StudentModel.find({ className })
        .select('fullName studentCode department createAt -_id');

      // Lấy danh sách sinh viên từ StatisticModel
      const studentsFromStatisticModel = await StatisticModel.find({ className, semester, schoolYear })
        .select('fullName studentCode isComplete createAt -_id');

      // Tạo một map để tra cứu nhanh sinh viên từ StatisticModel
      const studentMap = new Map();
      studentsFromStatisticModel.forEach(student => {
        studentMap.set(student.studentCode, student);
      });

      // Kết hợp danh sách sinh viên
      const combinedStudents = studentsFromStudentModel.map(student => {
        const existingStudent = studentMap.get(student.studentCode);
        if (existingStudent) {
          return existingStudent;
        } else {
          return { ...student.toObject(), isComplete: false };
        }
      });

      return {
        className,
        listStudents: combinedStudents,
      };
    });

    // Chờ tất cả các hứa hẹn hoàn thành
    const result = await Promise.all(classPromises);

    // Trả về kết quả dưới dạng JSON
    return res.json({ success: true, statistic: result });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ nội bộ',
    });
  }
});

module.exports = app;
