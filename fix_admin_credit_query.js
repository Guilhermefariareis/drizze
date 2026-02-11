const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'admin', 'AdminCreditManagement.tsx');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace profiles FK
    const profilesOld = 'profiles!credit_requests_patient_id_fkey';
    const profilesNew = 'profiles';
    if (content.includes(profilesOld)) {
        content = content.replace(profilesOld, profilesNew);
        console.log('Fixed profiles relationship');
    } else {
        console.log('profiles relationship not found or already fixed');
    }

    // Replace clinics FK
    const clinicsOld = 'clinics!credit_requests_clinic_id_fkey';
    const clinicsNew = 'clinics';
    if (content.includes(clinicsOld)) {
        content = content.replace(clinicsOld, clinicsNew);
        console.log('Fixed clinics relationship');
    } else {
        console.log('clinics relationship not found or already fixed');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated AdminCreditManagement.tsx');

} catch (err) {
    console.error('Error fixing file:', err);
    process.exit(1);
}
