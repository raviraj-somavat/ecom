const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword123',
    role: 'admin',
    verified: true,
    phone: '+91 9876543210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    addresses: [
      {
        street: '100 Silicon Way, Tech Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        country: 'India',
        isDefault: true,
      },
    ],
  },
  {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'userpassword123',
    role: 'user',
    verified: true,
    phone: '+91 9876543211',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    addresses: [
      {
        street: '42 MG Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        isDefault: true,
      },
    ],
  },
  {
    name: 'Priya Patel',
    email: 'priya@example.com',
    password: 'userpassword123',
    role: 'user',
    verified: true,
    phone: '+91 9876543212',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    addresses: [
      {
        street: '15 Marine Drive, Nariman Point',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400021',
        country: 'India',
        isDefault: true,
      },
    ],
  },
  {
    name: 'Amit Verma',
    email: 'amit@example.com',
    password: 'userpassword123',
    role: 'user',
    verified: true,
    phone: '+91 9876543213',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    addresses: [
      {
        street: '88 Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110001',
        country: 'India',
        isDefault: true,
      },
    ],
  },
];

export default users;
