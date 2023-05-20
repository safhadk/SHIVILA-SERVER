import Users from "../models/User.js";
import { sendEmail } from "../Helper/sendEmail.js";
import { generateToken } from "../middleware/jwt.js";
import bcrypt from 'bcrypt'

// 1.Register API

export const Register = async (req, res) => {
    try {
        const { email, password, phone } = req.body;

        if (!email) return res.status(400).json({ message: 'Enter Valid Email' });
        if (!password) return res.status(400).json({ message: 'Enter password' });
        if (!phone) return res.status(400).json({ message: 'Enter Valid phone number' });

        // Check if user already exists with the given email or mobile
        const existingUser = await Users.findOne({
            $or: [{ email: email }, { phone: phone }],
        });
        if (existingUser) {
            return res.status(409).json({ message: 'User already registered' });
        } else {
            // Create a new user
            const hashedPassword = await bcrypt.hash(password, 10);
            await Users.create({ email, password: hashedPassword, phone });
            return res.status(200).json({ message: 'User registered successfully' });
        }
    } catch (err) {
        console.error(`Error in Register: ${err.message}`);
        return res.status(500).json({ message: err.message });
    }
};

// 2.Login API

export const Login = async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;

        // validation
        if (!emailOrPhone) return res.status(400).json({ message: 'Enter email or phone number' });
        if (!password) return res.status(400).json({ message: 'Enter password' });

        // Find user by email or phone number
        const user = await Users.findOne({
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password' });

        // Generate JWT token
        const token = generateToken(user);

        // Return the token to the user
        return res.status(200).json({ message: "Login Successfull", token });
    } catch (err) {
        console.log(err)
        console.error(`Error in login: ${err.message}`);
        return res.status(500).json({ message: err.messsage });
    }
}

// 3.Subscription API

export const Subscribe = async (req, res) => {
    try {
        // Assume email is in req.body
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Enter Valid Email to Subscribe' });
        const user = await Users.findOne({ email });
        if (!user) { return res.status(404).json({ error: 'User not found' }); }
        else {
            const currentDate = new Date();

            // Check if user already has an active subscription
            if (user.subscription && currentDate <= user.subscription) {
                const daysUntilExpiration = Math.ceil((user.subscription - currentDate) / (1000 * 60 * 60 * 24));
                return res.status(200).json({ message: `Subscription already active, expires in ${daysUntilExpiration} days`, });
            }

            const subscriptionEndDate = new Date();
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 180);
            user.subscription = subscriptionEndDate;
            await user.save();
            await sendEmail(email)
            return res.status(200).json({ message: 'Subscription added successfully' });
        }
    } catch (err) {
        console.error(`Error in subscribe: ${err.message}`);
        return res.status(err.status || 500).send(err.message);
    }
}

// 4. Check subscription API

export const CheckSubscription = async (req, res) => {
    try {
        // Assume email is provided as a query parameter
        const { email } = req.query;
        console.log(email)
        if (!email) return res.status(400).json({ message: 'Enter Valid Email' });

        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        } else {
            const currentDate = new Date();
            if (user.subscription && currentDate <= user.subscription) {
                const daysUntilExpiration = Math.ceil((user.subscription - currentDate) / (1000 * 60 * 60 * 24));
                return res.status(200).json({ message: `Subscription Already Active, expires in ${daysUntilExpiration} days` });
            } else if (user.subscription && currentDate > user.subscription) {
                const daysAgo = Math.floor((currentDate - user.subscription) / (1000 * 60 * 60 * 24));
                return res.status(200).json({ message: `Your Subscription expired ${daysAgo} days ago` });
            } else {
                return res.status(200).json({ message: 'Subscription is not available' });
            }
        }
    } catch (err) {
        console.error(`Error in checkSubscription: ${err.message}`);
        return res.status(err.status || 500).send(err.message);
    }
}