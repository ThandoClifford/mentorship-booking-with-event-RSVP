<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mentorship Appointment Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f8fafc; padding:16px; color:#111827;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:8px; padding:20px;">
        <h2 style="margin-top:0;">Mentorship Appointment Confirmed</h2>
        <p>Hello {{ $student->name }},</p>
        <p>Your mentorship appointment is confirmed:</p>
        <ul>
            <li>Mentor: {{ $mentor->name }}</li>
            <li>Date: {{ $slot->date }}</li>
            <li>Time: {{ $slot->start_time }} - {{ $slot->end_time }}</li>
        </ul>
        <p>Appointments are required; please arrive on time. If you can’t attend, please cancel in advance.</p>
    </div>
</body>
</html>
