const express = require("express");
const router = express.Router();
const { Builder, By, until } = require('selenium-webdriver');
const cheerio = require('cheerio');

router.get("/resultLearning/:id", async (req, res) => {
    const idSinhVien = req.params.id; // Lấy id từ đường dẫn
    const URL = `http://dangkymonhoc.pyu.edu.vn/Default.aspx?page=xemdiemthi&id=${idSinhVien}`;

    // Khởi tạo trình duyệt
    const driver = new Builder().forBrowser('chrome').build();

    try {
        // Truy cập URL
        await driver.get(URL);

        // Chờ cho liên kết được tải và nhấp vào nó
        const linkSelector = By.css('#ctl00_ContentPlaceHolder1_ctl00_lnkChangeview2');
        await driver.wait(until.elementLocated(linkSelector), 10000);
        const linkElement = await driver.findElement(linkSelector);
        await linkElement.click();

        // Chờ điều hướng sau khi nhấp vào liên kết
        await driver.wait(until.urlContains('dangkymonhoc.pyu.edu.vn'), 10000);

        // Lấy nội dung HTML sau khi nhấp vào liên kết
        const htmlContent = await driver.getPageSource();

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
            const label = $(element).find('.Label').eq(1).text().trim();
            const score = $(element).find('.Label').eq(0).text().trim();

            // Lấy thông tin học kỳ và năm học tương ứng
            const kyvanamIndex = Math.floor(index / 6);

            // Tạo một đối tượng mới chứa thông tin label và score
            const diemTrungBinhHKObject = {
                label,
                score
            };

            // Đẩy đối tượng mới vào mảng data trong đối tượng tương ứng trong kyvanamArray
            kyvanamArray[kyvanamIndex].data.push(diemTrungBinhHKObject);
        });

        // Gửi dữ liệu JSON về client
        res.json(kyvanamArray);
    } catch (error) {
        console.error('Error fetching and parsing data:', error);
        res.status(500).send('Error fetching and parsing data');
    } finally {
        // Đóng trình duyệt sau khi hoàn thành
        await driver.quit();
    }
});

module.exports = router;
