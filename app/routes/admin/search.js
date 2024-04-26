const express = require("express");
const router = express.Router();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// Khởi động trình duyệt Puppeteer một lần và tái sử dụng nó cho mỗi yêu cầu
let browserInstance;

router.get(
    "/resultLearning/:id",
    async (req, res) => {
        try {
            const idSinhVien = req.params.id; // Lấy id từ đường dẫn
            const URL = `http://dangkymonhoc.pyu.edu.vn/Default.aspx?page=xemdiemthi&id=${idSinhVien}`;

            // Kiểm tra xem trình duyệt đã được khởi động chưa
            if (!browserInstance) {
                await puppeteer.launch({
                    headless: "new",
                    executablePath: 'C:\\Users\\Admin\\.cache\\puppeteer\\chrome\\win64-119.0.6045.105\\chrome-win64\\chrome.exe' // Đường dẫn bạn đã cài đặt
                });
            }

            // Tạo một trang mới từ trình duyệt đã khởi động trước đó
            const page = await browserInstance.newPage();

            // Truy cập trang web
            await page.goto(URL);

            // Chờ cho liên kết được tải và sau đó nhấp vào nó
            await page.waitForSelector('#ctl00_ContentPlaceHolder1_ctl00_lnkChangeview2');
            await page.click('#ctl00_ContentPlaceHolder1_ctl00_lnkChangeview2');

            // Chờ cho trang được tải sau khi nhấp vào liên kết
            await page.waitForNavigation();

            // Lấy nội dung HTML sau khi nhấp vào liên kết
            const htmlContent = await page.content();

            // Đóng trang sau mỗi yêu cầu
            await page.close();

            // Sử dụng Cheerio để phân tích HTML
            const $ = cheerio.load(htmlContent);

            const kyvanamArray = [];

            // Tìm và lưu thông tin về học kỳ và năm học vào mảng
            $('.title-hk-diem').each((index, element) => {
                // Trích xuất thông tin về học kỳ và năm học
                const label1 = $(element).find('.Label').eq(0).text().trim();
                const kyvanamObject = {
                    kyandnam: label1,
                    data: []
                };

                // Đẩy đối tượng mới vào mảng
                kyvanamArray.push(kyvanamObject);
            });

            // Tìm và lưu thông tin điểm trung bình học kỳ hệ 4 vào mảng mới
            $('.row-diemTK').each((index, element) => {
                // Trích xuất thông tin về điểm trung bình học kỳ
                const label = $(element).find('.Label').eq(0).text().trim();
                const score = $(element).find('.Label').eq(1).text().trim();

                // Lấy thông tin học kỳ và năm học tương ứng
                const kyvanamIndex = Math.floor(index / 6); // Mỗi học kỳ có 6 thông tin điểm, chia lấy phần nguyên để xác định index trong mảng kyvanamArray

                // Tạo một đối tượng mới chứa thông tin label và score
                const diemTrungBinhHKObject = {
                    label: label,
                    score: score
                };

                // Đẩy đối tượng mới vào mảng data trong đối tượng tương ứng trong kyvanamArray
                kyvanamArray[kyvanamIndex].data.push(diemTrungBinhHKObject);
            });

            // Gửi nội dung HTML về client
            res.json(kyvanamArray);
        } catch (error) {
            console.error('Error fetching and parsing data:', error);
            res.status(500).send('Error fetching and parsing data');
        }
    }
);

module.exports = router;
