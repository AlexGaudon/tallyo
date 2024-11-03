import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Plus, Trash2, TrashIcon, WrenchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CategoryBadge } from '~/components/categories/category-badge'
import { CreatePayee } from '~/components/payees/create-payee'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { DangerConfirm } from '~/components/ui/danger-confirm'
import { Dialog, DialogContent } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { categoriesQueries } from '~/services/categories'
import { payeeMutations, payeeQueries, UserPayee } from '~/services/payees'

export const Route = createFileRoute('/payees')({
  component: PayeesRoute,
  beforeLoad: async (ctx) => {
    if (!ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: '/signin',
      })
    }
    await ctx.context.queryClient.ensureQueryData(payeeQueries.getUserPayees())
    await ctx.context.queryClient.ensureQueryData(
      categoriesQueries.getUserCategories(),
    )
  },
})

export function PayeeDetail(
  props: UserPayee & {
    showKeywords: boolean
    onEdit?: () => void
  },
) {
  console.log('props: ', props)
  const { mutate: deletePayee } = payeeMutations.delete()

  const [newKeyword, setNewKeyword] = useState('')

  const { mutate: addKeyword } = payeeMutations.addKeyword(() => {
    setNewKeyword('')
  })

  const { mutate: removeKeyword } = payeeMutations.removeKeyword()

  const element = (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl">{props.name}</h2>
          <CategoryBadge
            name={props.category!.name}
            color={props.category!.color}
            link={false}
          />
        </div>
        {!props.showKeywords && (
          <div className="flex">
            <Button variant={'ghost'} onClick={() => props.onEdit?.()}>
              <WrenchIcon className="w-3 h-3" />
            </Button>
            <DangerConfirm
              onConfirm={() => {
                deletePayee({
                  id: props.id,
                })
              }}
            >
              <div className="flex">
                <Button variant="ghost">
                  <TrashIcon />
                </Button>
              </div>
            </DangerConfirm>
          </div>
        )}
      </div>

      {!props.showKeywords && (
        <>
          <div className="flex flex-wrap gap-2">
            {props.keywords.slice(0, 4).map((keyword) => (
              <span
                key={keyword}
                className="flex items-center gap-1 bg-zinc-700 px-2 py-1 rounded-full text-xs text-zinc-200"
              >
                {keyword.substring(0, 5)}...
              </span>
            ))}
          </div>
        </>
      )}
      {props.showKeywords && (
        <>
          <div className="flex flex-wrap gap-2">
            {props.keywords.map((keyword) => (
              <span
                key={keyword}
                className="flex items-center gap-1 bg-zinc-700 px-2 py-1 rounded-full text-xs text-zinc-200"
              >
                {keyword}

                <button
                  onClick={() => removeKeyword({ keyword })}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add keyword"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                addKeyword({
                  payeeId: props.id,
                  keyword: newKeyword,
                })
              }
              className="border-zinc-700 bg-zinc-800 text-zinc-200 placeholder-zinc-500"
            />
            <Button
              onClick={() => {
                addKeyword({
                  payeeId: props.id,
                  keyword: newKeyword,
                })
              }}
              variant="outline"
              size="icon"
              className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-200"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </>
  )

  if (props.showKeywords) {
    return element
  }

  return (
    <Card className="w-full max-w-md transition-colors" key={props.id}>
      <CardContent className="flex flex-col gap-4 p-4">{element}</CardContent>
    </Card>
  )
}

function PayeesRoute() {
  const { data } = useSuspenseQuery(payeeQueries.getUserPayees())

  const [open, setOpen] = useState(false)
  const [activePayee, setActivePayee] = useState<UserPayee | null>(null)
  const [activePayeeIdx, setActivePayeeIdx] = useState(0)

  useEffect(() => {
    if (data === null) return
    if (activePayeeIdx === null) return
    setActivePayee(data[activePayeeIdx])
  }, [activePayeeIdx, data])

  return (
    <div className="my-2">
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mb-12">
        {activePayee !== null && (
          <Dialog
            open={open}
            onOpenChange={(val) => {
              setOpen(val)
            }}
          >
            <DialogContent>
              <PayeeDetail showKeywords={true} {...activePayee} />
            </DialogContent>
          </Dialog>
        )}

        {data?.map((payee, idx) => (
          <PayeeDetail
            key={payee.id}
            showKeywords={false}
            {...payee}
            onEdit={() => {
              setActivePayeeIdx(idx)
              setOpen(true)
            }}
          />
        ))}
        <CreatePayee />
      </div>
    </div>
  )
}
