import type {
    ComponentResolver,
    ComponentInfo,
    SideEffectsInfo
} from '../../types'

import { kebabCase } from '../utils'

export interface VxeResolverOptions {
    /**
     * import style scss along with components
     * 
     * @default true
     */
    importStyle?: boolean | 'sass'

    /**
       * use commonjs lib & source css or scss for ssr
       */
    ssr?: boolean

    /**
     * exclude component name, if match do not resolve the name
     */
    exclude?: RegExp
}

type VxeResolverOptionsResolved = Required<Omit<VxeResolverOptions, 'exclude'>> & Pick<VxeResolverOptions, 'exclude'>

function getSideEffects(dirName: string, options: VxeResolverOptionsResolved): SideEffectsInfo | undefined {
    const { importStyle } = options
    const vxeStylesFolder = 'vxe-table/es/'
    if (importStyle === 'sass') {
        return `${vxeStylesFolder}/${dirName}/style.css`
    }
}

function resolveVxeComponent(name: string, options: VxeResolverOptionsResolved): ComponentInfo | undefined {
    if (options.exclude && name.match(options.exclude))
        return
    if (!name.match(/^Vxe[A-Z]/))
        return
    const partialName = kebabCase(name.slice(3)) // VxeButton -> button
    const { ssr } = options
    return {
        importName: name.slice(3),
        path: `vxe-table/${ssr ? 'lib' : 'es'}/${partialName}`,
        sideEffects: getSideEffects(partialName, options)
    }
}

export function VxeResolver(options?: VxeResolverOptions): ComponentResolver {
    let optionsResolved: VxeResolverOptionsResolved
    function resolveOptions() {
        if (optionsResolved) {
            return optionsResolved
        }
        optionsResolved = {
            importStyle: 'sass',
            ssr: false,
            ...options
        }
        return optionsResolved
    }
    return {
        type: 'component',
        resolve: (name: string) => {
            return resolveVxeComponent(name, resolveOptions())
        }
    }
}
