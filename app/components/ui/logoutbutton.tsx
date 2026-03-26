import { logout } from "../../(auth)/actions";



export default function LogoutButton() {
  return <form><button   className="w-full  bg-[#C9A96E] text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
     formAction={logout} >Log out</button></form>;
}