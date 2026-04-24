// Your Mock Email Database
const MOCK_EMAILS = [
    { 
        id: 1, 
        subject: "Interview Invitation - Data Scientist", 
        body: "Hi Saranya, we loved your profile. Can we chat tomorrow at 10 AM about the Data Science role?", 
        sender: "hr@techcorp.com" 
    },
    { 
        id: 2, 
        subject: "Amazon Order Confirmation", 
        body: "Your order for 'Casting Resin 2:1' has been shipped to Chennai.", 
        sender: "no-reply@amazon.com" 
    },
    { 
        id: 3, 
        subject: "Meeting Reminder: Project Head", 
        body: "One-on-one session scheduled to discuss your Docker and Airflow upskilling progress.", 
        sender: "manager@work.com" 
    },
    { 
        id: 4, 
        subject: "Resin Art Workshop", 
        body: "Don't forget the workshop this weekend on square-mold casting techniques!", 
        sender: "studio@art.in" 
    },
    {
        id: 5,
        subject: "Your Swiggy Order Delivered",
        body: "Hope you enjoyed your meal from A2B! Rate your experience.",
        sender: "no-reply@swiggy.in"
    },
    {
        id: 6,
        subject: "Internship Opportunity - AI Research",
        body: "We are offering a 3-month remote internship in AI/ML. Let us know if you're interested.",
        sender: "careers@innovatex.ai"
    },
    {
        id: 7,
        subject: "Electricity Bill - Due Reminder",
        body: "Your EB bill of ₹1450 is due on April 28. Avoid late fees by paying early.",
        sender: "tneb@tn.gov.in"
    },
    {
        id: 8,
        subject: "LinkedIn: Recruiter Viewed Your Profile",
        body: "A recruiter from Zoho recently viewed your profile. Update your resume to stand out!",
        sender: "notifications@linkedin.com"
    },
    {
        id: 9,
        subject: "Weekend Trip Plan",
        body: "Hey! Planning a Pondicherry trip this weekend. Let me know if you're in.",
        sender: "friend@gmail.com"
    },
    {
        id: 10,
        subject: "GitHub Security Alert",
        body: "We detected a new login to your GitHub account from a new device.",
        sender: "security@github.com"
    }
];

// Make it globally accessible
window.MOCK_EMAILS = MOCK_EMAILS;