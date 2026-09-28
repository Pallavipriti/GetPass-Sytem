import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, apartmentNo } = req.body;
  console.log("registerUser==>2",req.body);

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      apartmentNo,
    });
    
    console.log("register==>3",req.body);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
    console.log("loginnnnnnnnnnnnnnnnn=>", req.body);
  try {
    const { email, password } = req.body;
    console.log(email,password)

    const user = await User.findOne({ email });
    // if (!user || !(await user?.comparePassword(password))) {
    //   return res.status(401).json({ message: 'Invalid email or password' });
    // }
    if (!user?.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    res.json({
      user:{_id: user?._id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      apartmentNo: user?.apartmentNo,},
      token: generateToken(user?._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  console.log("getMe==>",req?.user?._id);
  try {
    const user = await User.findById(req.user?._id).select('-password');
    console.log("user",user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({users:[], message: error.message });
  }
};