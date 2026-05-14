import { ResumeData } from "../types";
import { toJapaneseEra } from "./eraConverter";

/**
 * Downloads resume data as a CSV file with automatic UTF-8 BOM.
 * This guarantees Japanese characters (Kanji, Katakana) do not become garbled in Excel!
 */
export function downloadCSV(resume: ResumeData) {
  const BOM = "\uFEFF";
  let csv = "";
  
  // Headers
  csv += `"Section","Field","Value"\r\n`;
  
  // Basic info
  csv += `"Basic Info","Full Name","${resume.fullName}"\r\n`;
  csv += `"Basic Info","Furigana","${resume.furigana}"\r\n`;
  csv += `"Basic Info","Gender","${resume.gender}"\r\n`;
  csv += `"Basic Info","Birth Date","${resume.birthYear}/${resume.birthMonth}/${resume.birthDay}"\r\n`;
  csv += `"Basic Info","Email","${resume.email}"\r\n`;
  csv += `"Basic Info","Phone","${resume.phone}"\r\n`;
  csv += `"Basic Info","Address","${resume.postalCode} ${resume.address}"\r\n`;
  
  // Education List
  csv += `"\r\n"\r\n`;
  csv += `"Education","School","Admission","Graduation","Major"\r\n`;
  resume.educationList.forEach((edu) => {
    csv += `"Education","${edu.schoolName}","${toJapaneseEra(parseInt(edu.admissionYear))}${edu.admissionMonth}月","${toJapaneseEra(parseInt(edu.graduationYear))}${edu.graduationMonth}月","${edu.major}"\r\n`;
  });

  // Work List
  csv += `"\r\n"\r\n`;
  csv += `"Work Experience","Company","Start Date","End Date","Position","Description","Achievement"\r\n`;
  resume.workList.forEach((work) => {
    const desc = work.description.replace(/"/g, '""');
    const ach = work.achievement.replace(/"/g, '""');
    csv += `"Work Experience","${work.companyName}","${toJapaneseEra(parseInt(work.startYear))}${work.startMonth}月","${toJapaneseEra(parseInt(work.endYear))}${work.endMonth}月","${work.position}","${desc}","${ach}"\r\n`;
  });

  // Skills
  csv += `"\r\n"\r\n`;
  csv += `"Skills","Type","Content"\r\n`;
  csv += `"Skills","Technical Skills","${resume.technicalSkills.replace(/"/g, '""')}"\r\n`;
  csv += `"Skills","Language Skills","${resume.languageSkills.replace(/"/g, '""')}"\r\n`;

  // Certifications
  csv += `"\r\n"\r\n`;
  csv += `"Certifications","Name","Acquisition Date"\r\n`;
  resume.certificationsList.forEach((cert) => {
    csv += `"Certifications","${cert.name}","${toJapaneseEra(parseInt(cert.year))}${cert.month}月"\r\n`;
  });

  // Motivation & Self-PR
  csv += `"\r\n"\r\n`;
  csv += `"Japanese Sections","Field","Content"\r\n`;
  csv += `"Japanese Sections","志望動機 (Reason for Application)","${resume.motivation.replace(/"/g, '""')}"\r\n`;
  csv += `"Japanese Sections","自己PR (Self PR)","${resume.selfPR.replace(/"/g, '""')}"\r\n`;

  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Japanese_Resume_${resume.fullName.replace(/\s+/g, '_')}_CSV.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates an Excel-compatible XML/HTML Spreadsheet structure.
 * Excel parses this flawlessly, retaining structured table grids and colors!
 */
export function downloadXLSX(resume: ResumeData) {
  const filename = `Japanese_Resume_${resume.fullName.replace(/\s+/g, '_')}_XLSX.xls`;
  
  let html = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>履歴書・職務経歴書</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
    <style>
      table { border-collapse: collapse; font-family: 'Noto Sans JP', sans-serif; }
      td, th { border: 1px solid #111111; padding: 6px; }
      .header-title { font-size: 18px; font-weight: bold; background-color: #e5e7eb; text-align: center; }
      .section-title { font-size: 14px; font-weight: bold; background-color: #f3f4f6; color: #1e3a8a; }
      .field-label { background-color: #f9fafb; font-weight: 500; width: 150px; }
    </style>
  </head>
  <body>
    <table>
      <!-- Section: Title -->
      <tr>
        <th colspan="4" class="header-title">履 歴 書 &amp; 職 務 経 歴 書 (AI Generated Standard)</th>
      </tr>
      <tr>
        <td colspan="4" style="background-color: #ffffff; border: none; height: 10px;"></td>
      </tr>
      
      <!-- Section: Basic Info -->
      <tr>
        <td colspan="4" class="section-title">基本情報 (Basic Information)</td>
      </tr>
      <tr>
        <td class="field-label">ふりがな (Furigana)</td>
        <td>${resume.furigana}</td>
        <td class="field-label">満年齢 (Age)</td>
        <td>満 ${new Date().getFullYear() - parseInt(resume.birthYear || "1995", 10)} 歳</td>
      </tr>
      <tr>
        <td class="field-label">氏名 (Full Name)</td>
        <td>${resume.fullName}</td>
        <td class="field-label">性別 (Gender)</td>
        <td>${resume.gender}</td>
      </tr>
      <tr>
        <td class="field-label">生年月日 (Birthdate)</td>
        <td>${resume.birthYear}年 ${resume.birthMonth}月 ${resume.birthDay}日</td>
        <td class="field-label">電話番号 (Phone)</td>
        <td>${resume.phone}</td>
      </tr>
      <tr>
        <td class="field-label">郵便番号 &amp; 住所 (Address)</td>
        <td colspan="3">${resume.postalCode} ${resume.address}</td>
      </tr>
      <tr>
        <td class="field-label">メール (Email)</td>
        <td colspan="3">${resume.email}</td>
      </tr>
      
      <tr>
        <td colspan="4" style="background-color: #ffffff; border: none; height: 15px;"></td>
      </tr>

      <!-- Section: Education -->
      <tr>
        <td colspan="4" class="section-title">学歴 (Education History)</td>
      </tr>
      <tr style="background-color: #f9fafb; font-weight: bold;">
        <td>入学年月 (Admission)</td>
        <td>卒業年月 (Graduation)</td>
        <td colspan="2">学校名・学部・学科 (School &amp; Major)</td>
      </tr>
      ${resume.educationList.map(edu => `
      <tr>
        <td>${toJapaneseEra(parseInt(edu.admissionYear))}${edu.admissionMonth}月</td>
        <td>${toJapaneseEra(parseInt(edu.graduationYear))}${edu.graduationMonth}月</td>
        <td colspan="2">${edu.schoolName} - ${edu.major}</td>
      </tr>
      `).join('')}

      <tr>
        <td colspan="4" style="background-color: #ffffff; border: none; height: 15px;"></td>
      </tr>

      <!-- Section: Work History -->
      <tr>
        <td colspan="4" class="section-title">職歴 (Work Experience)</td>
      </tr>
      <tr style="background-color: #f9fafb; font-weight: bold;">
        <td>就業開始 (Start)</td>
        <td>就業終了 (End)</td>
        <td>会社名・配属 (Company)</td>
        <td>役職・業務内容 (Position &amp; Summary)</td>
      </tr>
      ${resume.workList.map(work => `
      <tr>
        <td>${toJapaneseEra(parseInt(work.startYear))}${work.startMonth}月</td>
        <td>${toJapaneseEra(parseInt(work.endYear))}${work.endMonth}月</td>
        <td>${work.companyName}</td>
        <td>${work.position} - ${work.description}</td>
      </tr>
      `).join('')}

      <tr>
        <td colspan="4" style="background-color: #ffffff; border: none; height: 15px;"></td>
      </tr>

      <!-- Section: Licences -->
      <tr>
        <td colspan="4" class="section-title">免許・資格 (Certifications)</td>
      </tr>
      <tr style="background-color: #f9fafb; font-weight: bold;">
        <td colspan="2">取得年月 (Acquisition Date)</td>
        <td colspan="2">免許・資格名 (Certification Name)</td>
      </tr>
      ${resume.certificationsList.map(cert => `
      <tr>
        <td colspan="2">${toJapaneseEra(parseInt(cert.year))}${cert.month}月</td>
        <td colspan="2">${cert.name}</td>
      </tr>
      `).join('')}

      <tr>
        <td colspan="4" style="background-color: #ffffff; border: none; height: 15px;"></td>
      </tr>

      <!-- Section: Pasages -->
      <tr>
        <td colspan="4" class="section-title">志望動機 (Reason for Application)</td>
      </tr>
      <tr>
        <td colspan="4" style="text-align: left; vertical-align: top; height: 80px;">${resume.motivation || '空欄'}</td>
      </tr>

      <tr>
        <td colspan="4" style="background-color: #ffffff; border: none; height: 10px;"></td>
      </tr>

      <tr>
        <td colspan="4" class="section-title">自己PR (Self Promoting Pitch)</td>
      </tr>
      <tr>
        <td colspan="4" style="text-align: left; vertical-align: top; height: 80px;">${resume.selfPR || '空欄'}</td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
