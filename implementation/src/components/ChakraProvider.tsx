'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider as ChakraUIProvider } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface ProviderProps {
  children: ReactNode
}

/**
 * Providers component wraps the application with all necessary providers
 * 
 * This is a client component that wraps the application with the Chakra UI provider
 */
export function Providers({ children }: ProviderProps) {
  return (
    <CacheProvider>
      <ChakraUIProvider>
        {children}
      </ChakraUIProvider>
    </CacheProvider>
  )
}
