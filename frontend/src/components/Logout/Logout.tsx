import { useNavigate } from 'react-router-dom';
import { handleSignOut } from '../../services/api';

export const useLogout = () => {
    const navigate = useNavigate();

    const logout = async () => {
        await handleSignOut();
        navigate('/login');
    };

    return logout;
};

export default useLogout;