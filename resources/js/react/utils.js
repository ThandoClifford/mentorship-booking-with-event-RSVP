export function roleValue(user) {
    return user?.role || '';
}

export function roleHomePath(role) {
    if (role === 'student') return '/student';
    if (role === 'mentor') return '/mentor';
    if (role === 'admin' || role === 'super_admin') return '/admin';
    return '/login';
}

export const FACULTY_OPTIONS = [
    'Faculty of Agriculture and Natural Sciences',
    'Faculty of Economics, Development and Business Sciences',
    'Faculty of Education',
    'Faculty of Humanities',
    'Faculty of Engineering and the Built Environment',
    'Faculty of Information and Communication Technology',
    'Faculty of Health Sciences',
    'Faculty of Law',
    'Faculty of Public Administration and Management',
];
