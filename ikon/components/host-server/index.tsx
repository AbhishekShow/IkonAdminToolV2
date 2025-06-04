'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shadcn/ui/dropdown-menu'
import { Input } from '@/shadcn/ui/input'
import { Label } from '@/shadcn/ui/label'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { create } from 'zustand'
import AddEnv, { useEnvStore, loadEnvFromSessionStorage } from '../Add-Env'
import { setCookieSession } from '@/ikon/utils/cookieSession'
import { toast } from 'sonner'
import { apiReaquest } from '@/ikon/utils/apiRequest'
import { SubscriptionAlartDialog } from '@/ikon/components/subscriptionAlart'

type HostServerStore = {
  hostServer: string
  setHostServer: (value: string) => void
}

export const useHostServer = create<HostServerStore>((set) => ({
  hostServer: 'local',
  setHostServer: (value) => set({ hostServer: value }),
}))

export default function HostServer() {
  const { hostServer, setHostServer } = useHostServer()
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const { envs, setEnvs } = useEnvStore();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (open && envs.length === 0) {
      
      const laodedEnvs = loadEnvFromSessionStorage()
      setEnvs(laodedEnvs)
    }
  }, [open, envs, setEnvs])

  const checkIfSubscribedToApp = async () => {
    const subscriptionStatusUrl = '/api/remote/subscription/status';
    const response = await fetch(
      subscriptionStatusUrl,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },        
      }
    )

    if (!response.ok) {
      return false;
    }

    const {subscriptionStatus} = await response.json();
    return subscriptionStatus;
  }

  const handleLogin = async (server: string) => {
    setLoginError("")
    let host = "https://ikoncloud-dev.keross.com/ikon-api";
    for (let i = 0; i < envs.length; i++) {
      if (envs[i].server === server) {
        host = envs[i].auth
        break
      }
    }
    if (host === "") {
      toast.error('Please add the server link in the envs')
      return
    }
    debugger
    if (server === 'local-test') {
      setHostServer(server)
      setOpen(false)
      setLoginError('')
      setUsername('')
      setPassword('')
    } else {


      const loginDetails = {
        password: password,
        userlogin: username,
        host: host,
      };

      // const url = `https://ikoncloud-dev.keross.com/ikon-api/platform/auth/login`;
      // console.log(url)
      // console.log(loginDetails)
      try {
        //   const response = await fetch(url, {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(loginDetails),
        //   });
        // const data = await apiReaquest("/api/auth/login", {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(loginDetails),
        // })
        const response = await fetch("/api/auth/login", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginDetails),
        })

        const data = await response.json()
        console.log(data)
        debugger

        if (data.success) {
          setHostServer(server)
          setOpen(false)
          setLoginError('')
          setUsername('')
          setPassword('')

          await setCookieSession('currentloggedInServer', server);

          // if(server === 'local-auth'){
          //   const localServerUrl = envs.filter(env => env.server === 'local')[0].link;
          //   await setCookieSession('localHostURL', localServerUrl);
          // }

          const serverAuthUrl = envs.filter(env => env.server === server)[0].auth;
          await setCookieSession('serverAuthURL',serverAuthUrl);
          const serverUrl = envs.filter(env => env.server === server)[0].link;
          await setCookieSession('serverURL',serverUrl);

          toast.success(`Login successful in ${server}`)
          const isSubscribed = await checkIfSubscribedToApp();

          if(!isSubscribed) {
            setIsSubscriptionModalOpen(true);
          }

        } else {
          if(data.error === "Login failed")
            setLoginError( 'username or password is incorrect')
          else
            toast.error(data.error)
        }
      } catch (error) {
        console.error('Error during login:', error)
        toast.error('Login failed please contact support')
        // setLoginError('Login failed')
      }
    }

  }

  const changeEnv = (value: string) => {
    setHostServer(value)
    
    // if (value === 'local') {
    //   setOpen(false)
    //   setUsername('')
    //   setPassword('')
    //   setLoginError('')
    // } else {
    //   setUsername('')
    //   setPassword('')
    //   setLoginError('')
    // }
  }

  return (
    <>
    <DropdownMenu
      open={open}
      onOpenChange={(val) => {
        // only allow closing when it's local or user is already logged in
        if (hostServer === 'local' || val === true) {
          setOpen(val)
        }
      }}
    >

      <DropdownMenuTrigger asChild>
        <Button variant="outline" >
          Env: {hostServer}
          <div className="flex items-center ml-2">
            <DropdownMenuSeparator className="w-px h-5 bg-gray-300 mx-1" />
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-[22rem] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <DropdownMenuLabel className="text-base font-semibold">
            Host Server
          </DropdownMenuLabel>
          <AddEnv />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={hostServer}
          onValueChange={setHostServer}
          className="space-y-2"
        >
          {envs.map((env, index) => (
            <div key={index}>
              <DropdownMenuRadioItem value={env.server}>
                {env.server}
              </DropdownMenuRadioItem>

              {hostServer === env.server && (
                <div className="pt-2 border-t mt-2 space-y-4 px-3">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>

                  {loginError && (
                    <p className="text-sm text-red-500">{loginError}</p>
                  )}

                  <Button
                    className="w-full mt-2"
                    onClick={() => handleLogin(env.server)}
                  >
                    Login
                  </Button>
                  {index < (envs.length - 1) && (
                    <DropdownMenuSeparator />
                  )}
                </div>
              )}
            </div>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    <SubscriptionAlartDialog isOpen={isSubscriptionModalOpen} setOpen={setIsSubscriptionModalOpen}/>
    </>
  )
}
