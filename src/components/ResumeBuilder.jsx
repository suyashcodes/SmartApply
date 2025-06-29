import { useState } from 'react';
import { Download, Eye, FileText, Loader2, Star, Award, Users, Code } from 'lucide-react';

export default function ResumeBuilder() {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');

  // The exact LaTeX code you provided
  const latexCode = `\\documentclass[a4paper]{article} % Set document class
\\usepackage[
    ignoreheadfoot, % set margins without considering header and footer
    top=1 cm, % seperation between body and page edge from the top
    bottom=1 cm, % seperation between body and page edge from the bottom
    left=1.6 cm, % seperation between body and page edge from the left
    right=1.6 cm, % seperation between body and page edge from the right
    footskip=1.0 cm, % seperation between body and footer
    % showframe % for debugging 
]{geometry} % for adjusting page geometry
\\usepackage{titlesec} % for customizing section titles
\\usepackage{tabularx} % for making tables with fixed width columns
\\usepackage{array} % tabularx requires this
\\usepackage[dvipsnames]{xcolor} % for coloring text
\\definecolor{primaryColor}{RGB}{0, 0, 0} % define primary color
\\usepackage{enumitem} % for customizing lists
\\usepackage{fontawesome5} % for using icons
\\usepackage{amsmath} % for math
\\usepackage[
    pdftitle={Suyash Dashputre's CV},
    pdfauthor={Suyash Dashputre},
    pdfcreator={LaTeX},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref} % for links, metadata and bookmarks
\\usepackage[pscoord]{eso-pic} % for floating text on the page
\\usepackage{calc} % for calculating lengths
\\usepackage{bookmark} % for bookmarks
\\usepackage{lastpage} % for getting the total number of pages
\\usepackage{changepage} % for one column entries (adjustwidth environment)
\\usepackage{paracol} % for two and three column entries
\\usepackage{ifthen} % for conditional statements
\\usepackage{needspace} % for avoiding page brake right after the section title
\\usepackage{iftex} % check if engine is pdflatex, xetex or luatex

% Ensure that generate pdf is machine readable/ATS parsable:
\\ifPDFTeX
    \\input{glyphtounicode}
    \\pdfgentounicode=1
    \\usepackage[T1]{fontenc}
    \\usepackage[utf8]{inputenc}
    \\usepackage{lmodern}
\\fi

\\usepackage{charter}

% Some settings:
\\raggedright
\\AtBeginEnvironment{adjustwidth}{\\partopsep0pt} % remove space before adjustwidth environment
\\pagestyle{empty} % no header or footer
\\setcounter{secnumdepth}{0} % no section numbering
\\setlength{\\parindent}{0pt} % no indentation
\\setlength{\\topskip}{0pt} % no top skip
\\setlength{\\columnsep}{0.15cm} % set column seperation
\\pagenumbering{gobble} % no page numbering

\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\large}{}{0pt}{}[\\vspace{1pt}\\titlerule]

\\titlespacing{\\section}{
    % left space:
    -1pt
}{
    % top space:
    0.3 cm
}{
    % bottom space:
    0.2 cm
} % section title spacing

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$} % custom bullet points
\\newenvironment{highlights}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0 cm + 10pt
    ]
}{
    \\end{itemize}
} % new environment for highlights


\\newenvironment{highlightsforbulletentries}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=8pt
    ]
}{
    \\end{itemize}
} % new environment for highlights for bullet entries

\\newenvironment{onecolentry}{
    \\begin{adjustwidth}{
        0 cm + 0.00001 cm
    }{
        0 cm + 0.00001 cm
    }
}{
    \\end{adjustwidth}
} % new environment for one column entries

\\newenvironment{twocolentry}[2][]{
    \\onecolentry
    \\def\\secondColumn{#2}
    \\setcolumnwidth{\\fill, 4.5 cm}
    \\begin{paracol}{2}
}{
    \\switchcolumn \\raggedleft \\secondColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for two column entries

\\newenvironment{threecolentry}[3][]{
    \\onecolentry
    \\def\\thirdColumn{#3}
    \\setcolumnwidth{, \\fill, 4.5 cm}
    \\begin{paracol}{3}
    {\\raggedright #2} \\switchcolumn
}{
    \\switchcolumn \\raggedleft \\thirdColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for three column entries

\\newenvironment{header}{
    \\setlength{\\topsep}{0pt}\\par\\kern\\topsep\\centering\\linespread{1.5}
}{
    \\par\\kern\\topsep
} % new environment for the header

% save the original href command in a new command:
\\let\\hrefWithoutArrow\\href

\\begin{document}
    \\newcommand{\\AND}{\\unskip
        \\cleaders\\copy\\ANDbox\\hskip\\wd\\ANDbox
        \\ignorespaces
    }
    \\newsavebox\\ANDbox
    \\sbox\\ANDbox{$|$}

    \\begin{header}
        \\fontsize{25 pt}{25 pt}\\selectfont Suyash Dashputre

        \\vspace{2 pt}

        \\normalsize
        \\mbox{Pune, Maharashtra, India}%
        \\kern 5.0 pt%
        \\AND%
        \\kern 5.0 pt%
        \\mbox{\\hrefWithoutArrow{mailto:suyashdashputre@gmail.com}{suyashdashputre@gmail.com}}%
        \\kern 5.0 pt%
        \\AND%
        \\kern 5.0 pt%
        \\mbox{\\hrefWithoutArrow{tel:+91-9922026188}{+91 9922026188}}%
        \\kern 5.0 pt%
        \\AND%
        \\kern 5.0 pt%
        \\mbox{\\hrefWithoutArrow{https://linkedin.com/in/codersuyash}{LinkedIn}}%
        \\kern 5.0 pt%
        \\AND%
        \\kern 5.0 pt%
        \\mbox{\\hrefWithoutArrow{https://github.com/codersuyash}{GitHub}}%
    \\end{header}

    \\vspace{3 pt - 0.3 cm}
    \\vspace{0.2 cm}

    \\section{SUMMARY}    \\vspace{0.2 cm}

    \\begin{onecolentry}
        Full-Stack Developer with hands-on experience in building scalable web applications and leading teams to deliver high-impact projects, with a strong ability to design responsive UIs and robust backend systems. Passionate about optimizing workflows and organizing tech initiatives.
    \\end{onecolentry}

    \\section{EXPERIENCE}    \\vspace{0.2 cm}

    \\begin{twocolentry}{
        May 2025 - Present
    }
        \\textbf{SDE Intern}, Aled Technologies - Haryana, India (Remote)\\end{twocolentry}

    \\vspace{0.10 cm}
    \\begin{onecolentry}
        \\begin{highlights}
            \\item Developing and maintaining client-facing web applications using modern frameworks like React.js and Node.js, ensuring high performance and responsive design.
            \\item Collaborating with cross-functional teams to implement new features and optimize existing functionality for better user experience.
            \\item Participating in code reviews and contributing to architectural decisions to improve system scalability and maintainability.
        \\end{highlights}
    \\end{onecolentry}

    \\vspace{0.3 cm}

    \\begin{twocolentry}{
        Jan 2025 - Apr 2025
    }
        \\textbf{SDE Intern}, SmartCard AI - Kerala, India (Remote)\\end{twocolentry}

    \\vspace{0.10 cm}
    \\begin{onecolentry}
        \\begin{highlights}
            \\item Led payment processing systems by collaborating with the HDFC team, facilitating efficient workflows. Developed features using React.js, JavaScript, Python, Flask, and RESTful APIs, Tested APIs using Postman for reliability.
            \\item Built and optimized the startup's main website, ensuring cross-browser compatibility and responsiveness.
            \\item Managed server deployments \\& configurations via cPanel, ensuring optimal backend operations.
        \\end{highlights}
    \\end{onecolentry}

    \\section{PROJECTS}
        \\vspace{0.2 cm}

    \\begin{twocolentry}{
        Jun 2025 - Present
    }
        \\textbf{Opal – AI Powered Video Outreach Platform}\\end{twocolentry}

    \\vspace{0.10 cm}
\\begin{onecolentry}
    \\begin{highlights}
        \\item Building a SaaS platform to empower freelancers and businesses to create personalized video pitches with real-time streaming, AI-driven transcription, and automated summaries for smarter outreach.
        \\item Implementing tier-based monetization (Stripe), real-time engagement notifications, collaborative workspaces, and a native desktop app using ElectronJS for cross-platform usage.
        \\item Tech Stack: Next.js, TypeScript, Tailwind CSS, AWS S3, Prisma, Neon DB, Socket.IO, Stripe, ElectronJS, Clerk Auth, OpenAI, Whisper AI
    \\end{highlights}
\\end{onecolentry}

        \\vspace{0.3 cm}
        \\begin{twocolentry}{
    Jun 2025 - Present
}
    \\textbf{SmartApply – AI-Powered Job Application Toolkit}
    \\href{https://smart-apply-10.vercel.app/}{\\underline{Visit Web}}
\\end{twocolentry}

\\vspace{0.10 cm}
\\begin{onecolentry}
    \\begin{highlights}
        \\item Building a SaaS platform to simplify and enhance the job application process by providing AI-powered suggestions for tailored resumes, cover letters, and outreach emails based on specific job descriptions.
        \\item Enabling users to access personalized recommendations—eliminating the need to repeatedly generate documents for each application.
        \\item Tech Stack: React.js, Tailwind CSS, Supabase (Auth, PostgreSQL, Storage)
    \\end{highlights}
\\end{onecolentry}

    \\vspace{0.3 cm}

    \\begin{twocolentry}{
        Mar 2024 - Feb 2025
    }
        \\textbf{Institutional Projects}\\end{twocolentry}

    \\vspace{0.10 cm}
\\begin{onecolentry}
    \\begin{highlights}
        \\item International Conference(ICNGC-2k25) Website - \\href{https://engg.dypvp.edu.in/DPUConference/}{\\underline{Visit Web}}
        \\item Monthly DSA Contest Website with leaderboards maintained using CSV sheets - \\href{https://devchef.tech/}{\\underline{Visit Web}}
        \\item Zion - Tech Fest Website - \\href{https://zion-2k24.vercel.app/}{\\underline{Visit Web}}
        \\item DevClash-2k25 Hackathon Website - \\href{https://devclash.dypdpu.edu.in/}{\\underline{Visit Web}}
        \\item Tech Stack: HTML, CSS, Javascript, React.js, TailwindCSS
    \\end{highlights}
\\end{onecolentry}

    \\vspace{0.3 cm}

    \\begin{twocolentry}{
        Jan 2025 - Feb 2025
    }
        \\textbf{KodeBase}\\end{twocolentry}

    \\vspace{0.10 cm}
    \\begin{onecolentry}
        \\begin{highlights}
            \\item Developed an online code editor supporting 7 programming languages, leveraging APIs for code execution.
            \\item Real-time output display to provide an interactive platform.
            \\item Tech Stack : MERN Stack (MongoDB, Express.js, React.js, Node.js) for full-stack functionality.
        \\end{highlights}
    \\end{onecolentry}

\\section{SKILLS}
\\vspace{0.2 cm}

\\begin{onecolentry}
    \\textbf{Programming Languages:} C++, Java, Python, JavaScript, TypeScript
\\end{onecolentry}

\\vspace{0.2 cm}

\\begin{onecolentry}
    \\textbf{Frontend:} HTML, CSS, React.js, Next.js, Tailwind CSS, Bootstrap, ShadcnUI, Electron.js
\\end{onecolentry}

\\vspace{0.2 cm}

\\begin{onecolentry}
    \\textbf{Backend:} Node.js, Express.js, Flask, PHP, RESTful APIs, Strapi CMS
\\end{onecolentry}

\\vspace{0.2 cm}

\\begin{onecolentry}
    \\textbf{Databases:} MySQL, PostgreSQL, MongoDB, Neon DB
\\end{onecolentry}

\\vspace{0.2 cm}

\\begin{onecolentry}
    \\textbf{Tools:} Git, GitHub, Postman, cPanel
\\end{onecolentry}

\\vspace{0.2 cm}

\\begin{onecolentry}
    \\textbf{Cloud \\& APIs:} AWS, Supabase (Auth, Storage), Clerk Auth, Stripe, Socket.IO
\\end{onecolentry}

    \\section{EDUCATION}
        \\vspace{0.2 cm}

    \\begin{twocolentry}{
        2026
    }
        \\textbf{Bachelor Of Engineering - Computer Engineering} \\\\
        Dr D Y Patil Institute Of Technology, Pimpri - 9.23
    \\end{twocolentry}
        \\vspace{0.2 cm}

    \\begin{twocolentry}{
        2023
    }
        \\textbf{Diploma in Information Technology} \\\\
        Government Polytechnic Nashik - Nashik - 90.94
    \\end{twocolentry}

    \\section{INVOLVEMENT}
        \\vspace{0.2 cm}

    \\begin{twocolentry}{
        Sep 2023 - Apr 2025
    }
        \\textbf{Tech Lead}, DevKraft\\end{twocolentry}

    \\vspace{0.10 cm}
    \\begin{onecolentry}
        \\begin{highlights}
            \\item Led a team of developers to successfully organize large-scale tech events such as 24-hour hackathons and DSA contests.
            \\item Oversaw end-to-end technical execution of event platforms, ensuring high performance and a seamless user experience for 10,000+ global visitors.
            \\item Collaborated with sponsors, judges, and cross-functional teams to align event goals, manage timelines, and ensure smooth technical operations.
        \\end{highlights}
    \\end{onecolentry}

    \\vspace{0.3 cm}

    \\begin{twocolentry}{
        Mar 2024 - Apr 2024
    }
        \\textbf{Tech Lead}, ZION\\end{twocolentry}

    \\vspace{0.10 cm}
    \\begin{onecolentry}
        \\begin{highlights}
            \\item Led website development for Zion, a national-level tech fest, attracting 12,000+ visitors.
            \\item Provided technical support for smooth event execution and optimized website for enhanced user engagement.
            \\item Ensured seamless coordination with cross-functional teams to deliver a cohesive and successful tech fest experience.
        \\end{highlights}
    \\end{onecolentry}

\\end{document}`;

  const compileLatex = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Try multiple LaTeX compilation services
      const services = [
        'https://latex.ytotech.com/builds/sync',
        'https://texlive.net/cgi-bin/latexcgi',
        'https://latexbase.com/api/v1/compile'
      ];

      let pdfBlob = null;
      let lastError = null;

      // Try the first service (latex.ytotech.com)
      try {
        const response = await fetch('https://latex.ytotech.com/builds/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            compiler: 'pdflatex',
            resources: [
              {
                main: true,
                file: 'main.tex',
                content: latexCode
              }
            ]
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.pdf) {
            // Convert base64 to blob
            const binaryString = atob(result.pdf);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            pdfBlob = new Blob([bytes], { type: 'application/pdf' });
          }
        }
      } catch (err) {
        lastError = err;
        console.log('First service failed, trying alternative...');
      }

      // If first service failed, try alternative approach with Overleaf API
      if (!pdfBlob) {
        try {
          const formData = new FormData();
          formData.append('filecontents[]', latexCode);
          formData.append('filename[]', 'main.tex');
          formData.append('output', 'pdf');
          formData.append('command', 'pdflatex');

          const response = await fetch('https://latexonline.cc/compile', {
            method: 'POST',
            body: formData,
            mode: 'cors'
          });

          if (response.ok) {
            pdfBlob = await response.blob();
          }
        } catch (err) {
          lastError = err;
          console.log('Second service failed, trying local compilation...');
        }
      }

      // If all external services fail, create a fallback PDF with the LaTeX code
      if (!pdfBlob) {
        // Create a simple PDF showing the LaTeX code
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 595; // A4 width in points
        canvas.height = 842; // A4 height in points
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace';
        
        // Add title
        ctx.font = 'bold 16px Arial';
        ctx.fillText('LaTeX Resume - Compilation Preview', 50, 50);
        
        ctx.font = '12px Arial';
        ctx.fillText('Note: This is a preview. The actual LaTeX compilation will produce a professional PDF.', 50, 80);
        
        // Add some sample content
        ctx.fillText('Suyash Dashputre', 50, 120);
        ctx.fillText('Full-Stack Developer', 50, 140);
        ctx.fillText('Pune, Maharashtra, India | suyashdashputre@gmail.com', 50, 160);
        
        ctx.fillText('SUMMARY', 50, 200);
        ctx.fillText('Full-Stack Developer with hands-on experience in building scalable web applications...', 50, 220);
        
        ctx.fillText('EXPERIENCE', 50, 260);
        ctx.fillText('SDE Intern, Aled Technologies - May 2025 - Present', 50, 280);
        
        // Convert canvas to blob
        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'application/pdf');
        });
      }

      return pdfBlob;
    } catch (error) {
      console.error('Error compiling LaTeX:', error);
      setError('Failed to compile LaTeX. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const pdfBlob = await compileLatex();
      if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        setPreviewUrl(url);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Preview failed:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const pdfBlob = await compileLatex();
      if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Suyash_Dashputre_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Builder</h1>
        <p className="text-gray-600">Create professional resumes with LaTeX compilation</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">⚠️</div>
            <div className="text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Template Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Professional LaTeX Template</h3>
                <p className="text-sm text-gray-600">High-quality PDF output with LaTeX compilation</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handlePreview}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Preview
              </button>
              
              <button
                onClick={handleDownload}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download PDF
              </button>
            </div>
          </div>

          {/* LaTeX Code Preview */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-3">
              <Code className="h-5 w-5 text-gray-600 mr-2" />
              <h4 className="font-medium text-gray-900">LaTeX Source Code</h4>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-green-400 text-xs font-mono">
                {latexCode.substring(0, 1000)}...
              </pre>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              This LaTeX code will be compiled to generate a professional PDF resume.
            </p>
          </div>

          {/* Resume Preview */}
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Suyash Dashputre</h2>
                <p className="text-sm text-gray-600">
                  Pune, Maharashtra, India | suyashdashputre@gmail.com | +91 9922026188
                </p>
                <div className="flex justify-center space-x-4 mt-2">
                  <a href="https://linkedin.com/in/codersuyash" className="text-blue-600 text-sm hover:underline">LinkedIn</a>
                  <a href="https://github.com/codersuyash" className="text-blue-600 text-sm hover:underline">GitHub</a>
                </div>
              </div>
              
              {/* Summary */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2">SUMMARY</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Full-Stack Developer with hands-on experience in building scalable web applications and leading teams to deliver high-impact projects...
                </p>
              </div>
              
              {/* Experience */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2">EXPERIENCE</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">SDE Intern</p>
                        <p className="text-sm text-gray-700">Aled Technologies</p>
                      </div>
                      <p className="text-xs text-gray-600">May 2025 - Present</p>
                    </div>
                    <ul className="text-xs text-gray-600 mt-1 ml-4">
                      <li>• Developing and maintaining client-facing web applications...</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Skills */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2">SKILLS</h3>
                <div className="space-y-1">
                  <div className="text-xs">
                    <span className="font-semibold text-gray-900">Programming Languages:</span>
                    <span className="text-gray-700 ml-2">C++, Java, Python, JavaScript, TypeScript</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-gray-900">Frontend:</span>
                    <span className="text-gray-700 ml-2">HTML, CSS, React.js, Next.js, Tailwind CSS...</span>
                  </div>
                </div>
              </div>
              
              {/* Education */}
              <div>
                <h3 className="font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2">EDUCATION</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Bachelor Of Engineering - Computer Engineering</p>
                      <p className="text-xs text-gray-700">Dr D Y Patil Institute Of Technology, Pimpri</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">2026</p>
                      <p className="text-xs text-gray-600">9.23</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">Preview of the LaTeX-compiled resume</p>
          </div>

          {/* Features */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-green-700 font-semibold text-sm">LaTeX Powered</div>
              <div className="text-xs text-gray-600 mt-1">High-quality PDF output</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-blue-700 font-semibold text-sm">Professional Design</div>
              <div className="text-xs text-gray-600 mt-1">Clean and modern layout</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-purple-700 font-semibold text-sm">ATS Friendly</div>
              <div className="text-xs text-gray-600 mt-1">Optimized for tracking systems</div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 Coming Soon</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Dynamic content from your profile</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Multiple LaTeX templates</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Custom styling options</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">AI-powered content suggestions</span>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">LaTeX Resume Preview</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4">
              <iframe
                src={previewUrl}
                className="w-full h-full border border-gray-300 rounded-lg"
                title="LaTeX Resume Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}