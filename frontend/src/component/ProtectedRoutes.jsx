import Cookies from 'js-cookie';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoutes = () => {
    const token=Cookies.get('accessToken');
    const type=parseInt(Cookies.get('type'));

    if(!token){
        return <Navigate to='/adminlogin' replace />
    }

    else if(type!==1){
        return <Navigate to='/login' replace />
    }

    return <Outlet />
}

export default ProtectedRoutes;
