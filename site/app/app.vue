<script lang="ts" setup>
import type { FormError, FormSubmitEvent, Locale, Messages, TableColumn } from '@nuxt/ui';
import * as locales from '@nuxt/ui/locale';
import { h, resolveComponent } from 'vue'
import text from '~/assets/locale.json';
import type { Table } from '../../src/lib';
import { main } from '../../src/lib';

const UButton = resolveComponent('UButton')
const toast = useToast();

const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const colorMode = useColorMode()
colorMode.preference = systemPrefersDark ? 'dark' : 'light';

const languages = [
  // 🌍 Global
  { code: 'en', icon: 'flag:us-4x3', module: () => Promise.resolve(locales.en), text: text.en },
  { code: 'sp', icon: 'flag:es-4x3', module: () => Promise.resolve(locales.es), text: text.es },
  { code: 'pt', icon: 'flag:br-4x3', module: () => Promise.resolve(locales.pt_br), text: text.pt_br },
  { code: 'fr', icon: 'flag:fr-4x3', module: () => Promise.resolve(locales.fr), text: text.fr },
  { code: 'de', icon: 'flag:de-4x3', module: () => Promise.resolve(locales.de), text: text.de },
  { code: 'it', icon: 'flag:it-4x3', module: () => Promise.resolve(locales.it), text: text.it },
  { code: 'uk', icon: 'flag:ua-4x3', module: () => Promise.resolve(locales.uk), text: text.uk },
  { code: 'pl', icon: 'flag:pl-4x3', module: () => Promise.resolve(locales.pl), text: text.pl },
  { code: 'tr', icon: 'flag:tr-4x3', module: () => Promise.resolve(locales.tr), text: text.tr },
  { code: 'ru', icon: 'flag:ru-4x3', module: () => Promise.resolve(locales.ru), text: text.ru },

  // 🌏 Asia
  { code: 'hi', icon: 'flag:in-4x3', module: () => Promise.resolve(locales.hi), text: text.hi },
  { code: 'id', icon: 'flag:id-4x3', module: () => Promise.resolve(locales.id), text: text.id },
  { code: 'vi', icon: 'flag:vn-4x3', module: () => Promise.resolve(locales.vi), text: text.vi },
  { code: 'zh', icon: 'flag:cn-4x3', module: () => Promise.resolve(locales.zh_cn), text: text.zh_cn },
  { code: 'ja', icon: 'flag:jp-4x3', module: () => Promise.resolve(locales.ja), text: text.ja },
  { code: 'ko', icon: 'flag:kr-4x3', module: () => Promise.resolve(locales.ko), text: text.ko },

  // 🌍 Middle East / Africa
  { code: 'fa', icon: 'flag:ir-4x3', module: () => Promise.resolve(locales.fa_ir), text: text.fa },
  { code: 'ar', icon: 'flag:arab-4x3', module: () => Promise.resolve(locales.ar), text: text.ar },
] as const;


const acceptedCodes = new Set<typeof languages[number]['code']>(languages.map(l => l.code));
const currentLocale = ref<Locale<Messages>>();
const currentText = computed(() => languages.find(l => l.code === reactiveState.language)?.text ?? text.en);

const getLang = () => {
  const navLang = navigator.language?.split('-')[0]?.toLowerCase();
  if(!navLang) return 'en'
  return acceptedCodes.has(navLang as typeof languages[number]['code']) ? navLang : 'en';
};

const defaultState = {
  hostname: 'localhost',
  protocol: 'http://',
  port: 4567,
  path: '/',
  username: '',
  password: '',
  sheetId: "1vxvAHxmLLgAEEq-jWbDw5fxHMdz1N_PNWe3OPXtrin0",
  sheetGid: 0,
  protocols: ['http://', 'https://'],
  language: getLang(),
  loading: false,
};

const reactiveState = reactive({ ...defaultState });

const credentialsRequired = computed(() => !!reactiveState.username || !!reactiveState.password);

const fullURL = computed(() => {
  if (!reactiveState.hostname || !reactiveState.protocol || !reactiveState.port) return false;
  if (reactiveState.username && !reactiveState.password) return false;
  if (!reactiveState.username && reactiveState.password) return false;
  const auth = reactiveState.username && reactiveState.password
    ? `${reactiveState.username}:${reactiveState.password}@`
    : '';
  return `${reactiveState.protocol}${auth}${reactiveState.hostname}:${reactiveState.port}${reactiveState.path}`;
});

const canReset = computed(() => {
  const ignored = ['protocols', 'language', 'loading'];
  return Object.entries(defaultState).some(([key, val]) => {
    if (ignored.includes(key)) return false;
    return reactiveState[key as keyof typeof defaultState] !== val;
  });
});

const reset = () => {
  Object.assign(reactiveState, structuredClone(defaultState));
}

const validate = (s: typeof defaultState): FormError[] => {
  const errors = [];
  const t = currentText.value;
  if (!s.hostname) errors.push({ name: 'hostname', message: t["hostname.error.required"] });
  if (s.hostname.includes('/')) errors.push({ name: 'hostname', message: t["hostname.error.path"] });
  if (s.password && !s.username) errors.push({ name: 'username', message: t["credentials.error.missing_username"] });
  if (s.username && !s.password) errors.push({ name: 'password', message: t["credentials.error.missing_password"] });
  if (s.sheetGid == null) errors.push({ name: 'gid', message: t["gid.error.required"] });
  if (!s.sheetId) errors.push({ name: 'sheetId', message: t["sheetId.error.required"] });
  return errors;
};

const results = ref<Table<true>>([]);

async function onSubmit(_: FormSubmitEvent<typeof reactiveState>) {
  reactiveState.loading = true
  const t = currentText.value;
  if (typeof fullURL.value !== 'string') {
    toast.add({ title: t["toast.error.title"], description: t["error.incomplete_url"] });
    reactiveState.loading = false;
    return;
  }
  const { sheetId, sheetGid } = reactiveState;
  if (!sheetId || sheetGid == null) {
    toast.add({ title: t["toast.error.title"], description: t["error.invalid_sheet"] });
    reactiveState.loading = false;
    return;
  }
  try {
    const pull = await main({ fullURL: fullURL.value, sheetGid, sheetId });
    if (!pull.success) {
      toast.add({ title: t["toast.error.title"], description: pull.error, color: 'error' });
      reactiveState.loading = false;
      return;
    }
    results.value = pull.data;
    reactiveState.loading = false;
  } catch(e) {
    let err = t["error.unknown"];
    if(e instanceof Error) err = e.message
    if(typeof e === 'string') err = e;
    toast.add({ title: t["toast.error.title"], description: err, color: 'error' });
    reactiveState.loading = false;
  }
}

type Row = Table<true>[number]

const columns: TableColumn<Row>[] = [
{
  accessorKey: 'Title',
  header: ({ column }) => {
    const isSorted = column.getIsSorted()
    return h(UButton, {
      label: 'Title',
      icon: isSorted
        ? isSorted === 'asc'
          ? 'i-lucide-arrow-up-narrow-wide'
          : 'i-lucide-arrow-down-wide-narrow'
        : 'i-lucide-arrow-up-down',
      variant: 'ghost',
      class: '-mx-2.5',
      onClick: () => column.toggleSorting(isSorted === 'asc')
    })
  },
  cell: ({ row }) =>
    h('div', {
      class: 'sm:max-w-[24rem] whitespace-normal break-words overflow-hidden text-sm',
      style: {
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      },
      title: row.getValue('Title')
    }, row.getValue('Title'))
},

  {
    accessorKey: 'Categories',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        label: 'Categories',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        variant: 'ghost',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(isSorted === 'asc')
      })
    },
    cell: ({ row }) => {
      const categories = row.getValue('Categories') as string[] | undefined
      return categories?.join(', ') ?? '-'
    }
  },
  {
    accessorKey: 'Reading status',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        label: 'Reading Status',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        variant: 'ghost',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(isSorted === 'asc')
      })
    }
  },
  {
    accessorKey: 'Detection type',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        label: currentText.value['table.type'],
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        variant: 'ghost',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(isSorted === 'asc')
      })
    },
    cell: ({ row }) => {
      const type = row.getValue('Detection type') as 'DMCA' | 'SUSPICIOUS'
      const color = {
        DMCA: 'error',
        SUSPICIOUS: 'warning'
      }[type] ?? 'gray'

      return h(
        'span',
        { class: `text-sm font-medium text-${color}-600 capitalize` },
        type
      )
    }
  },
  {
    accessorKey: 'Missing chaps (%)',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        label: currentText.value['table.missing'],
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        variant: 'ghost',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(isSorted === 'asc')
      })
    },
    cell: ({ row }) => `${row.getValue('Missing chaps (%)')}%`
  },
{
  accessorKey: 'URL',
  header: currentText.value['table.URL'],
  cell: ({ row }) =>
    h(UButton, {
      label: currentText.value['table.open'],
      icon: 'i-lucide-external-link',
      color: 'primary',
      variant: 'soft',
      size: 'xs',
      class: 'whitespace-nowrap text-xs sm:text-sm px-2',
      onClick: () => window.open(row.getValue('URL'), '_blank', 'noopener')
    })
}
]

const sorting = ref([{ id: 'Detection type', desc: false }])

function open(url: string) {
  window.open(url, '_blank', 'noopener')
}

const htmlLang = computed(() => currentLocale.value?.code || 'en')
const htmlDir = computed(() => currentLocale.value?.dir || 'ltr')

watch(() => reactiveState.language, async (lang) => {
  const entry = languages.find(l => l.code === lang)
  if (!entry) return
  currentLocale.value = await entry.module()
}, { immediate: true })

useHead({
  htmlAttrs: {
    lang: htmlLang,
    dir: htmlDir,
  }
})
</script>
<template>
  <UApp :locale="currentLocale">
    <UHeader>
      <UContainer class="flex justify-end items-center h-16 px-4 sm:px-8">
        <div class="flex items-center gap-3">
          <!-- Desktop: inline icons -->
          <div class="hidden sm:flex items-center gap-3">
            <template v-for="{ code, icon } in languages" :key="code">
              <Icon
                :name="icon"
                size="1.25rem"
                :class="[ 
                  'cursor-pointer transition rounded-sm',
                  reactiveState.language === code
                    ? 'ring-2 ring-primary'
                    : 'opacity-50 hover:opacity-100 hover:scale-110'
                ]"
                @click="reactiveState.language = code"
              />
            </template>
          </div>

          <!-- Mobile: dropdown menu -->
          <div class="sm:hidden">
            <UDropdownMenu
              :items="languages.map(({ code, icon }) => ({
                label: code.toUpperCase(),
                icon,
                click: () => reactiveState.language = code
              }))"
              :ui="{
                content: 'max-h-64 overflow-y-auto',
                item: 'flex items-center gap-2 px-3 py-2',
                itemLeadingIcon: 'w-12 h-12'
              }"
            >
              <Icon name="i-heroicons-language" size="1.5rem" class="cursor-pointer" />
            </UDropdownMenu>
          </div>
        </div>
      </UContainer>
    </UHeader>

    <UMain>
      <UForm
        v-if="!results.length"
        class="max-w-4xl border mx-auto mt-6 sm:mt-10 rounded-xl shadow-xl bg-background border-muted"
        :state="reactiveState"
        :validate="validate"
        @submit="onSubmit"
      >
        <HeaderLogo :title="currentText['main.title']" :description="currentText['main.description']" />

        <!-- Section: Connection -->
        <div class="border-t bg-muted p-5 space-y-4">
          <div class="flex flex-col">
            <span class="text-lg font-semibold text-foreground">
              {{ currentText['url.label'] }}
            </span>
            <span class="text-muted-foreground text-xs">
              {{ currentText['url.hint'] }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
            <UFormField class="lg:col-span-1" :label="currentText['protocol.label']" name="protocol" required>
              <USelectMenu v-model="reactiveState.protocol" :items="defaultState.protocols" class="w-full" />
            </UFormField>
            <UFormField class="lg:col-span-2" :label="currentText['hostname.label']" name="hostname" required>
              <UInput v-model="reactiveState.hostname" class="w-full" />
            </UFormField>
            <UFormField class="lg:col-span-1" :label="currentText['port.label']" name="port" required>
              <UInputNumber
                v-model="reactiveState.port"
                class="w-full sm:w-32"
                :min="80"
                :max="65535"
                :format-options="{ useGrouping: false }"
              />
            </UFormField>
            <UFormField class="lg:col-span-2" name="path">
              <template #label>
                {{ currentText['path.label'] }} <sup class="text-muted-foreground">{{ currentText['path.optional'] }}</sup>
              </template>
              <UInput v-model="reactiveState.path" class="w-full" placeholder="/custompath" />
            </UFormField>
          </div>
        </div>

        <!-- Section: Auth -->
        <div class="border-t bg-muted p-5 space-y-4">
          <div class="flex flex-col">
            <span class="text-lg font-semibold text-foreground">
              {{ currentText['auth.label'] }}
            </span>
            <span class="text-muted-foreground text-xs">
              {{ currentText['auth.hint'] }}
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField name="username" :required="credentialsRequired">
              <template #label>
                {{ currentText['username.label'] }} <sup v-if="!credentialsRequired" class="text-muted-foreground">{{ currentText['path.optional'] }}</sup>
              </template>
              <UInput v-model="reactiveState.username" class="w-full" />
            </UFormField>

            <UFormField name="password" :required="credentialsRequired">
              <template #label>
                {{ currentText['password.label'] }} <sup v-if="!credentialsRequired" class="text-muted-foreground">{{ currentText['path.optional'] }}</sup>
              </template>
              <UInput v-model="reactiveState.password" class="w-full" type="password" />
            </UFormField>
          </div>
        </div>

        <!-- Section: Sheet -->
        <div class="border-t bg-muted p-5 space-y-4">
          <div class="flex flex-col">
            <span class="text-lg font-semibold text-foreground">
              {{ currentText['config.label'] }}
            </span>
            <span class="text-muted-foreground text-xs">
              {{ currentText['config.hint'] }}
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UFormField class="sm:col-span-2" :label="currentText['sheetId.label']" name="sheetId" required>
              <UInput v-model="reactiveState.sheetId" class="w-full" :placeholder="currentText['sheetId.placeholder']" />
            </UFormField>
            <UFormField class="sm:col-span-1" :label="currentText['gid.label']" name="gid" required>
              <UInputNumber
                v-model="reactiveState.sheetGid"
                class="w-full sm:w-1/2"
                :min="0"
                :format-options="{ useGrouping: false }"
              />
            </UFormField>
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t bg-muted p-5">
          <UButton
            v-if="canReset && !reactiveState.loading"
            variant="ghost"
            color="neutral"
            icon="i-lucide-rotate-ccw"
            class="cursor-pointer"
            @click="reset"
          >
            {{ currentText['button.reset'] }}
          </UButton>
          <UButton
            type="submit"
            icon="i-lucide-check"
            class="cursor-pointer"
            :loading="reactiveState.loading"
            :disabled="validate(reactiveState).length > 0 || reactiveState.loading"
          >
            {{ currentText['button.submit'] }}
          </UButton>
        </div>
      </UForm>

      <!-- Results Table -->
      <div
        v-else
        class="max-w-4xl mx-auto mt-6 sm:mt-10 mb-20 bg-background rounded-xl shadow-xl border border-muted overflow-hidden"
      >
        <HeaderLogo :title="currentText['main.title']" :description="currentText['main.description']" />
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 bg-muted border-t border-b border-muted-foreground/20">
          <span class="text-base sm:text-lg font-semibold text-foreground">
            {{ results.length }} {{ currentText['table.results'] }}
          </span>
          <UButton
            class="cursor-pointer"
            color="red"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="sm"
            @click="results = []"
          >
            RESET
          </UButton>
        </div>

        <div class="hidden lg:block w-full overflow-x-auto">
          <UTable :columns="columns" :data="results" v-model:sorting="sorting" class="min-w-[640px] lg:min-w-full" />
        </div>

        <div class="lg:hidden space-y-3">
          <div
            v-for="(row, idx) in results"
            :key="idx"
            class="border-t p-3 sm:p-5 bg-muted"
          >
            <p class="font-semibold text-base text-foreground break-words">
              {{ row.Title }}
            </p>
            <p class="text-sm mt-1 text-muted-foreground">
              {{ row['Categories']?.join(', ') || '-' }}
            </p>
            <p class="text-sm mt-1 flex gap-1">
              <span class="font-medium text-foreground">{{ currentText['table.status'] }}:</span>
              <span class="text-foreground">{{ row['Reading status'] }}</span>
            </p>
            <p class="text-sm mt-1 flex gap-1">
              <span class="font-medium text-foreground">{{ currentText['table.type'] }}:</span>
              <span
                :class="{
                  'text-error font-semibold': row['Detection type'] === 'DMCA',
                  'text-warning font-semibold': row['Detection type'] === 'SUSPICIOUS'
                }"
              >
                {{ row['Detection type'] }}
              </span>
            </p>
            <p class="text-sm mt-1 flex gap-1 text-foreground">
              <span class="font-medium">{{ currentText['table.missing'] }}:</span>
              {{ row['Missing chaps (%)'] }}%
            </p>
            <div class="mt-3">
              <UButton
                icon="i-lucide-external-link"
                :label="currentText['table.open']"
                color="primary"
                variant="soft"
                size="xl"
                class="w-full cursor-pointer"
                @click="() => open(row.URL)"
              />
            </div>
          </div>
        </div>
      </div>
    </UMain>
  </UApp>
</template>